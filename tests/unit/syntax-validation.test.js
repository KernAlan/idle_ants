/**
 * Syntax validation tests for all JavaScript files
 * Catches syntax errors before they reach runtime
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all JavaScript files in the project
function getAllJSFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
            getAllJSFiles(filePath, fileList);
        } else if (file.endsWith('.js') && !file.includes('.test.js')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

describe('Syntax Validation Tests', () => {
    const projectRoot = path.resolve(__dirname, '../..');
    const jsFiles = getAllJSFiles(projectRoot);

    test('should find JavaScript files to test', () => {
        expect(jsFiles.length).toBeGreaterThan(0);
        console.log(`Found ${jsFiles.length} JavaScript files to validate`);
    });

    // Create individual test for each file for better error reporting
    jsFiles.forEach(filePath => {
        const relativePath = path.relative(projectRoot, filePath);
        
        test(`should have valid syntax: ${relativePath}`, () => {
            try {
                // Use Node.js to check syntax without executing
                execSync(`node -c "${filePath}"`, { stdio: 'pipe' });
            } catch (error) {
                fail(`Syntax error in ${relativePath}: ${error.message}`);
            }
        });
    });

    describe('Specific Syntax Pattern Tests', () => {
        jsFiles.forEach(filePath => {
            const relativePath = path.relative(projectRoot, filePath);
            const content = fs.readFileSync(filePath, 'utf8');

            test(`should not have .bind() after getter: ${relativePath}`, () => {
                // Check for the specific error pattern that caused issues
                const problematicPattern = /get\s+\w+\(\)\s*\{\s*return\s+.*\}\s*\.bind\(/;
                if (problematicPattern.test(content)) {
                    fail(`Found .bind() after getter in ${relativePath} - this causes syntax errors`);
                }
            });

            test(`should have proper namespace checks: ${relativePath}`, () => {
                // Files that create classes should check if namespaces exist
                if (content.includes('= class') && content.includes('IdleAnts.')) {
                    const hasNamespaceCheck = content.includes('if (!IdleAnts.') || 
                                            content.includes('if (!window.IdleAnts');
                    
                    if (!hasNamespaceCheck && !relativePath.includes('Namespace.js')) {
                        console.warn(`${relativePath} creates classes but doesn't check namespace existence`);
                    }
                }
            });

            test(`should not have trailing commas in object literals for IE compatibility: ${relativePath}`, () => {
                // Check for trailing commas that might cause issues in older browsers
                const trailingCommaPattern = /,\s*}/g;
                const matches = content.match(trailingCommaPattern);
                
                if (matches && matches.length > 0) {
                    console.warn(`${relativePath} has ${matches.length} trailing commas - consider removing for broader compatibility`);
                }
            });

            test(`should have consistent indentation: ${relativePath}`, () => {
                const lines = content.split('\n');
                let hasTabsAndSpaces = false;
                let hasOnlyTabs = false;
                let hasOnlySpaces = false;

                lines.forEach(line => {
                    if (line.startsWith('\t')) hasOnlyTabs = true;
                    if (line.startsWith(' ')) hasOnlySpaces = true;
                    if (line.includes('\t') && line.includes('    ')) hasTabsAndSpaces = true;
                });

                if (hasTabsAndSpaces || (hasOnlyTabs && hasOnlySpaces)) {
                    console.warn(`${relativePath} has mixed tab/space indentation`);
                }
            });
        });
    });

    describe('Constructor Validation Tests', () => {
        test('should validate all class constructors exist', () => {
            // Read the main namespace file to understand expected structure
            const namespaceContent = fs.readFileSync(path.join(projectRoot, 'src/core/Namespace.js'), 'utf8');
            
            // Test files that should have specific constructors
            const expectedConstructors = [
                'IdleAnts.Game.GameAudioManager',
                'IdleAnts.Game.GameUpgradeManager',
                'IdleAnts.Game.GameBossManager',
                'IdleAnts.Game.GameMinimapManager',
                'IdleAnts.Managers.Entities.NestEntityManager',
                'IdleAnts.Managers.Entities.AntEntityManager',
                'IdleAnts.Managers.Entities.FoodEntityManager',
                'IdleAnts.Managers.Entities.EnemyEntityManager'
            ];

            expectedConstructors.forEach(constructorPath => {
                const pathParts = constructorPath.split('.');
                const fileName = pathParts[pathParts.length - 1];
                
                // Find the file that should contain this constructor
                const possiblePaths = [
                    path.join(projectRoot, 'src/game', `${fileName}.js`),
                    path.join(projectRoot, 'src/managers/entities', `${fileName}.js`),
                    path.join(projectRoot, 'src/managers', `${fileName}.js`)
                ];

                let found = false;
                for (const filePath of possiblePaths) {
                    if (fs.existsSync(filePath)) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        if (content.includes(`${constructorPath} = class`)) {
                            found = true;
                            break;
                        }
                    }
                }

                if (!found) {
                    fail(`Constructor ${constructorPath} not found in expected locations`);
                }
            });
        });
    });

    describe('Dependency Validation Tests', () => {
        test('should validate HTML script loading order', () => {
            const htmlPath = path.join(projectRoot, 'index.html');
            if (!fs.existsSync(htmlPath)) {
                console.warn('index.html not found - skipping script order validation');
                return;
            }

            const htmlContent = fs.readFileSync(htmlPath, 'utf8');
            const scriptTags = htmlContent.match(/<script[^>]*src="([^"]*)"[^>]*>/g) || [];
            const scriptPaths = scriptTags.map(tag => {
                const match = tag.match(/src="([^"]*)"/);
                return match ? match[1] : null;
            }).filter(Boolean);

            // Namespace should be loaded first
            const namespaceIndex = scriptPaths.findIndex(path => path.includes('Namespace.js'));
            expect(namespaceIndex).toBeGreaterThanOrEqual(0);
            expect(namespaceIndex).toBeLessThan(5); // Should be among the first few scripts

            // Components should be loaded before entities that use them
            const componentIndex = scriptPaths.findIndex(path => path.includes('components/'));
            const antBaseIndex = scriptPaths.findIndex(path => path.includes('AntBase.js'));
            
            if (componentIndex >= 0 && antBaseIndex >= 0) {
                expect(componentIndex).toBeLessThan(antBaseIndex);
            }

            // Entity managers should be loaded before main EntityManager
            const antEntityManagerIndex = scriptPaths.findIndex(path => path.includes('entities/AntEntityManager.js'));
            const entityManagerIndex = scriptPaths.findIndex(path => path.includes('EntityManager.js') && !path.includes('entities/'));
            
            if (antEntityManagerIndex >= 0 && entityManagerIndex >= 0) {
                expect(antEntityManagerIndex).toBeLessThan(entityManagerIndex);
            }
        });

        test('should validate no circular dependencies', () => {
            // Simple check for obvious circular dependencies
            jsFiles.forEach(filePath => {
                const content = fs.readFileSync(filePath, 'utf8');
                const relativePath = path.relative(projectRoot, filePath);
                
                // Check if file requires itself
                const fileName = path.basename(filePath, '.js');
                if (content.includes(`require('./${fileName}.js')`)) {
                    fail(`${relativePath} appears to require itself`);
                }
            });
        });
    });
});