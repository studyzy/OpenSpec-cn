import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ArchiveCommand } from '../../src/core/archive.js';
import { Validator } from '../../src/core/validation/validator.js';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Mock @inquirer/prompts
vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
  confirm: vi.fn()
}));

describe('ArchiveCommand', () => {
  let tempDir: string;
  let archiveCommand: ArchiveCommand;
  const originalConsoleLog = console.log;

  beforeEach(async () => {
    // Create temp directory
  tempDir = path.join(os.tmpdir(), `openspec-archive-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    
    // Change to temp directory
    process.chdir(tempDir);
    
    // Create OpenSpec structure
  const openspecDir = path.join(tempDir, 'openspec');
  await fs.mkdir(path.join(openspecDir, 'changes'), { recursive: true });
  await fs.mkdir(path.join(openspecDir, 'specs'), { recursive: true });
  await fs.mkdir(path.join(openspecDir, 'changes', 'archive'), { recursive: true });
    
    // Suppress console.log during tests
    console.log = vi.fn();
    
    archiveCommand = new ArchiveCommand();
  });

  afterEach(async () => {
    // Restore console.log
    console.log = originalConsoleLog;
    
    // Clear mocks
    vi.clearAllMocks();
    
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('execute', () => {
    it('should archive a change successfully', async () => {
      // Create a test change
      const changeName = 'test-feature';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      await fs.mkdir(changeDir, { recursive: true });
      
      // Create tasks.md with completed tasks
      const tasksContent = '- [x] Task 1\n- [x] Task 2';
      await fs.writeFile(path.join(changeDir, 'tasks.md'), tasksContent);
      
      // Execute archive with --yes flag
      await archiveCommand.execute(changeName, { yes: true });
      
      // Check that change was moved to archive
      const archiveDir = path.join(tempDir, 'openspec', 'changes', 'archive');
      const archives = await fs.readdir(archiveDir);
      
      expect(archives.length).toBe(1);
      expect(archives[0]).toMatch(new RegExp(`\\d{4}-\\d{2}-\\d{2}-${changeName}`));
      
      // Verify original change directory no longer exists
      await expect(fs.access(changeDir)).rejects.toThrow();
    });

    it('should warn about incomplete tasks', async () => {
      const changeName = 'incomplete-feature';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      await fs.mkdir(changeDir, { recursive: true });
      
      // Create tasks.md with incomplete tasks
      const tasksContent = '- [x] Task 1\n- [ ] Task 2\n- [ ] Task 3';
      await fs.writeFile(path.join(changeDir, 'tasks.md'), tasksContent);
      
      // Execute archive with --yes flag
      await archiveCommand.execute(changeName, { yes: true });
      
      // Verify warning was logged
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('警告：发现 2 个未完成任务')
      );
    });

    it('should update specs when archiving (delta-based ADDED) and include change name in skeleton', async () => {
      const changeName = 'spec-feature';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      const changeSpecDir = path.join(changeDir, 'specs', 'test-capability');
      await fs.mkdir(changeSpecDir, { recursive: true });
      
      // Create delta-based change spec (ADDED requirement)
      const specContent = `# Test Capability Spec - Changes

## 新增需求

### 需求： The system SHALL provide test capability

#### Scenario: Basic test
Given a test condition
When an action occurs
Then expected result happens`;
      await fs.writeFile(path.join(changeSpecDir, 'spec.md'), specContent);
      
      // Execute archive with --yes flag and skip validation for speed
      await archiveCommand.execute(changeName, { yes: true, noValidate: true });
      
      // Verify spec was created from skeleton and ADDED requirement applied
      const mainSpecPath = path.join(tempDir, 'openspec', 'specs', 'test-capability', 'spec.md');
      const updatedContent = await fs.readFile(mainSpecPath, 'utf-8');
      expect(updatedContent).toContain('# test-capability 规范');
      expect(updatedContent).toContain('## 目的');
      expect(updatedContent).toContain(`由归档变更 ${changeName} 创建`);
      expect(updatedContent).toContain('## 需求');
      expect(updatedContent).toContain('### 需求： The system SHALL provide test capability');
      expect(updatedContent).toContain('#### Scenario: Basic test');
    });

    it('should allow REMOVED requirements when creating new spec file (issue #403)', async () => {
      const changeName = 'new-spec-with-removed';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      const changeSpecDir = path.join(changeDir, 'specs', 'gift-card');
      await fs.mkdir(changeSpecDir, { recursive: true });
      
      // Create delta spec with both ADDED and REMOVED requirements
      // This simulates refactoring where old fields are removed and new ones are added
      const specContent = `# Gift Card - Changes

## ADDED Requirements

### Requirement: Logo and Background Color
The system SHALL support logo and backgroundColor fields for gift cards.

#### Scenario: Display gift card with logo
- **WHEN** a gift card is displayed
- **THEN** it shows the logo and backgroundColor

## REMOVED Requirements

### Requirement: Image Field
### Requirement: Thumbnail Field`;
      await fs.writeFile(path.join(changeSpecDir, 'spec.md'), specContent);
      
      // Execute archive - should succeed with warning about REMOVED requirements
      await archiveCommand.execute(changeName, { yes: true, noValidate: true });
      
      // Verify warning was logged about REMOVED requirements being ignored
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('警告：gift-card - 2 条“移除需求”操作已被忽略（无内容可删除）。')
      );
      
      // Verify spec was created with only ADDED requirements
      const mainSpecPath = path.join(tempDir, 'openspec', 'specs', 'gift-card', 'spec.md');
      const updatedContent = await fs.readFile(mainSpecPath, 'utf-8');
      expect(updatedContent).toContain('# gift-card 规范');
      expect(updatedContent).toContain('### Requirement: Logo and Background Color');
      expect(updatedContent).toContain('#### Scenario: Display gift card with logo');
      // REMOVED requirements should not be in the final spec
      expect(updatedContent).not.toContain('### Requirement: Image Field');
      expect(updatedContent).not.toContain('### Requirement: Thumbnail Field');
      
      // Verify change was archived successfully
      const archiveDir = path.join(tempDir, 'openspec', 'changes', 'archive');
      const archives = await fs.readdir(archiveDir);
      expect(archives.length).toBeGreaterThan(0);
      expect(archives.some(a => a.includes(changeName))).toBe(true);
    });

    it('should still error on MODIFIED when creating new spec file', async () => {
      const changeName = 'new-spec-with-modified';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      const changeSpecDir = path.join(changeDir, 'specs', 'new-capability');
      await fs.mkdir(changeSpecDir, { recursive: true });
      
      // Create delta spec with MODIFIED requirement (should fail for new spec)
      const specContent = `# New Capability - Changes

## ADDED Requirements

### Requirement: New Feature
New feature description.

## MODIFIED Requirements

### Requirement: Existing Feature
Modified content.`;
      await fs.writeFile(path.join(changeSpecDir, 'spec.md'), specContent);
      
      // Execute archive - should abort with error message (not throw, but log and return)
      await archiveCommand.execute(changeName, { yes: true, noValidate: true });
      
      // Verify error message mentions MODIFIED not allowed for new specs
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('new-capability：目标规范不存在；新规范仅允许“新增需求”操作。“修改需求”和“重命名需求”操作需要现有规范。')
      );
      expect(console.log).toHaveBeenCalledWith('已中止。未更改任何文件。');
      
      // Verify spec was NOT created
      const mainSpecPath = path.join(tempDir, 'openspec', 'specs', 'new-capability', 'spec.md');
      await expect(fs.access(mainSpecPath)).rejects.toThrow();
      
      // Verify change was NOT archived
      const archiveDir = path.join(tempDir, 'openspec', 'changes', 'archive');
      const archives = await fs.readdir(archiveDir);
      expect(archives.some(a => a.includes(changeName))).toBe(false);
    });

    it('should still error on RENAMED when creating new spec file', async () => {
      const changeName = 'new-spec-with-renamed';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      const changeSpecDir = path.join(changeDir, 'specs', 'another-capability');
      await fs.mkdir(changeSpecDir, { recursive: true });
      
      // Create delta spec with RENAMED requirement (should fail for new spec)
      const specContent = `# Another Capability - Changes

## ADDED Requirements

### Requirement: New Feature
New feature description.

## RENAMED Requirements
- FROM: \`### Requirement: Old Name\`
- TO: \`### Requirement: New Name\``;
      await fs.writeFile(path.join(changeSpecDir, 'spec.md'), specContent);
      
      // Execute archive - should abort with error message (not throw, but log and return)
      await archiveCommand.execute(changeName, { yes: true, noValidate: true });
      
      // Verify error message mentions RENAMED not allowed for new specs
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('another-capability：目标规范不存在；新规范仅允许“新增需求”操作。“修改需求”和“重命名需求”操作需要现有规范。')
      );
      expect(console.log).toHaveBeenCalledWith('已中止。未更改任何文件。');
      
      // Verify spec was NOT created
      const mainSpecPath = path.join(tempDir, 'openspec', 'specs', 'another-capability', 'spec.md');
      await expect(fs.access(mainSpecPath)).rejects.toThrow();
      
      // Verify change was NOT archived
      const archiveDir = path.join(tempDir, 'openspec', 'changes', 'archive');
      const archives = await fs.readdir(archiveDir);
      expect(archives.some(a => a.includes(changeName))).toBe(false);
    });

    it('should throw error if change does not exist', async () => {
      await expect(
        archiveCommand.execute('non-existent-change', { yes: true })
      ).rejects.toThrow("未找到更改 'non-existent-change'。");
    });

    it('should throw error if archive already exists', async () => {
      const changeName = 'duplicate-feature';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      await fs.mkdir(changeDir, { recursive: true });
      
      // Create existing archive with same date
      const date = new Date().toISOString().split('T')[0];
      const archivePath = path.join(tempDir, 'openspec', 'changes', 'archive', `${date}-${changeName}`);
      await fs.mkdir(archivePath, { recursive: true });
      
      // Try to archive
      await expect(
        archiveCommand.execute(changeName, { yes: true })
      ).rejects.toThrow(`归档 '${date}-${changeName}' 已存在。`);
    });

    it('should handle changes without tasks.md', async () => {
      const changeName = 'no-tasks-feature';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      await fs.mkdir(changeDir, { recursive: true });
      
      // Execute archive without tasks.md
      await archiveCommand.execute(changeName, { yes: true });
      
      // Should complete without warnings
      expect(console.log).not.toHaveBeenCalledWith(
        expect.stringContaining('未完成任务')
      );
      
      // Verify change was archived
      const archiveDir = path.join(tempDir, 'openspec', 'changes', 'archive');
      const archives = await fs.readdir(archiveDir);
      expect(archives.length).toBe(1);
    });

    it('should handle changes without specs', async () => {
      const changeName = 'no-specs-feature';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      await fs.mkdir(changeDir, { recursive: true });
      
      // Execute archive without specs
      await archiveCommand.execute(changeName, { yes: true });
      
      // Should complete without spec updates
      expect(console.log).not.toHaveBeenCalledWith(
        expect.stringContaining('Specs to update')
      );
      
      // Verify change was archived
      const archiveDir = path.join(tempDir, 'openspec', 'changes', 'archive');
      const archives = await fs.readdir(archiveDir);
      expect(archives.length).toBe(1);
    });

    it('should skip spec updates when --skip-specs flag is used', async () => {
      const changeName = 'skip-specs-feature';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      const changeSpecDir = path.join(changeDir, 'specs', 'test-capability');
      await fs.mkdir(changeSpecDir, { recursive: true });
      
      // Create spec in change
      const specContent = '# Test Capability Spec\n\nTest content';
      await fs.writeFile(path.join(changeSpecDir, 'spec.md'), specContent);
      
      // Execute archive with --skip-specs flag and noValidate to skip validation
      await archiveCommand.execute(changeName, { yes: true, skipSpecs: true, noValidate: true });
      
      // Verify skip message was logged
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('跳过验证')
      );
      
      // Verify spec was NOT copied to main specs
      const mainSpecPath = path.join(tempDir, 'openspec', 'specs', 'test-capability', 'spec.md');
      await expect(fs.access(mainSpecPath)).rejects.toThrow();
      
      // Verify change was still archived
      const archiveDir = path.join(tempDir, 'openspec', 'changes', 'archive');
      const archives = await fs.readdir(archiveDir);
      expect(archives.length).toBe(1);
      expect(archives[0]).toMatch(new RegExp(`\\d{4}-\\d{2}-\\d{2}-${changeName}`));
    });

    it('should skip validation when commander sets validate to false (--no-validate)', async () => {
      const changeName = 'skip-validation-flag';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      const changeSpecDir = path.join(changeDir, 'specs', 'unstable-capability');
      await fs.mkdir(changeSpecDir, { recursive: true });

      const deltaSpec = `# Unstable Capability

## 新增需求

### 需求： Logging Feature
**ID**: REQ-LOG-001

The system will log all events.

#### Scenario: Event recorded
- **WHEN** an event occurs
- **THEN** it is captured`;
      await fs.writeFile(path.join(changeSpecDir, 'spec.md'), deltaSpec);
      await fs.writeFile(path.join(changeDir, 'tasks.md'), '- [x] Task 1\n');

      const deltaSpy = vi.spyOn(Validator.prototype, 'validateChangeDeltaSpecs');
      const specContentSpy = vi.spyOn(Validator.prototype, 'validateSpecContent');

      try {
        await archiveCommand.execute(changeName, { yes: true, skipSpecs: true, validate: false });

        expect(deltaSpy).not.toHaveBeenCalled();
        expect(specContentSpy).not.toHaveBeenCalled();

        const archiveDir = path.join(tempDir, 'openspec', 'changes', 'archive');
        const archives = await fs.readdir(archiveDir);
        expect(archives.length).toBe(1);
        expect(archives[0]).toMatch(new RegExp(`\\d{4}-\\d{2}-\\d{2}-${changeName}`));
      } finally {
        deltaSpy.mockRestore();
        specContentSpy.mockRestore();
      }
    });

    it('should proceed with archive when user declines spec updates', async () => {
      const { confirm } = await import('@inquirer/prompts');
      const mockConfirm = confirm as unknown as ReturnType<typeof vi.fn>;
      
      const changeName = 'decline-specs-feature';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      const changeSpecDir = path.join(changeDir, 'specs', 'test-capability');
      await fs.mkdir(changeSpecDir, { recursive: true });
      
      // Create valid spec in change
      const specContent = `# Test Capability Spec

## Purpose
This is a test capability specification.

## 需求

### The system SHALL provide test capability

#### Scenario: Basic test
Given a test condition
When an action occurs
Then expected result happens`;
      await fs.writeFile(path.join(changeSpecDir, 'spec.md'), specContent);
      
      // Mock confirm to return false (decline spec updates)
      mockConfirm.mockResolvedValueOnce(false);
      
      // Execute archive without --yes flag
      await archiveCommand.execute(changeName);
      
      // Verify user was prompted about specs
      expect(mockConfirm).toHaveBeenCalledWith({
        message: '继续执行规范更新吗？',
        default: true
      });
      
      // Verify skip message was logged
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('跳过规范更新')
      );
      
      // Verify spec was NOT copied to main specs
      const mainSpecPath = path.join(tempDir, 'openspec', 'specs', 'test-capability', 'spec.md');
      await expect(fs.access(mainSpecPath)).rejects.toThrow();
      
      // Verify change was still archived
      const archiveDir = path.join(tempDir, 'openspec', 'changes', 'archive');
      const archives = await fs.readdir(archiveDir);
      expect(archives.length).toBe(1);
      expect(archives[0]).toMatch(new RegExp(`\\d{4}-\\d{2}-\\d{2}-${changeName}`));
    });

    it('should support header trim-only normalization for matching', async () => {
      const changeName = 'normalize-headers';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      const changeSpecDir = path.join(changeDir, 'specs', 'alpha');
      await fs.mkdir(changeSpecDir, { recursive: true });

      // Create existing main spec with a requirement (no extra trailing spaces)
      const mainSpecDir = path.join(tempDir, 'openspec', 'specs', 'alpha');
      await fs.mkdir(mainSpecDir, { recursive: true });
      const mainContent = `# alpha Specification

## Purpose
Alpha purpose.

## 需求

### 需求： Important Rule
Some details.`;
      await fs.writeFile(path.join(mainSpecDir, 'spec.md'), mainContent);

      // Change attempts to modify the same requirement but with trailing spaces after the name
      const deltaContent = `# Alpha - Changes

## 修改需求

### 需求： Important Rule   
Updated details.`;
      await fs.writeFile(path.join(changeSpecDir, 'spec.md'), deltaContent);

      await archiveCommand.execute(changeName, { yes: true, noValidate: true });

      const updated = await fs.readFile(path.join(mainSpecDir, 'spec.md'), 'utf-8');
      expect(updated).toContain('### 需求： Important Rule');
      expect(updated).toContain('Updated details.');
    });

    it('should apply operations in order: RENAMED → REMOVED → MODIFIED → ADDED', async () => {
      const changeName = 'apply-order';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      const changeSpecDir = path.join(changeDir, 'specs', 'beta');
      await fs.mkdir(changeSpecDir, { recursive: true });

      // Main spec with two requirements A and B
      const mainSpecDir = path.join(tempDir, 'openspec', 'specs', 'beta');
      await fs.mkdir(mainSpecDir, { recursive: true });
      const mainContent = `# beta Specification

## Purpose
Beta purpose.

## 需求

### 需求： A
content A

### 需求： B
content B`;
      await fs.writeFile(path.join(mainSpecDir, 'spec.md'), mainContent);

      // Rename A->C, Remove B, Modify C, Add D
      const deltaContent = `# Beta - Changes

## 重命名需求
- FROM: \`### 需求： A\`
- TO: \`### 需求： C\`

## 移除需求
### 需求： B

## 修改需求
### 需求： C
updated C

## 新增需求
### 需求： D
content D`;
      await fs.writeFile(path.join(changeSpecDir, 'spec.md'), deltaContent);

      await archiveCommand.execute(changeName, { yes: true, noValidate: true });

      const updated = await fs.readFile(path.join(mainSpecDir, 'spec.md'), 'utf-8');
      expect(updated).toContain('### 需求： C');
      expect(updated).toContain('updated C');
      expect(updated).toContain('### 需求： D');
      expect(updated).not.toContain('### 需求： A');
      expect(updated).not.toContain('### 需求： B');
    });

    it('should abort with error when MODIFIED/REMOVED reference non-existent requirements', async () => {
      const changeName = 'validate-missing';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      const changeSpecDir = path.join(changeDir, 'specs', 'gamma');
      await fs.mkdir(changeSpecDir, { recursive: true });

      // Main spec with no requirements
      const mainSpecDir = path.join(tempDir, 'openspec', 'specs', 'gamma');
      await fs.mkdir(mainSpecDir, { recursive: true });
      const mainContent = `# gamma Specification

## Purpose
Gamma purpose.

## 需求`;
      await fs.writeFile(path.join(mainSpecDir, 'spec.md'), mainContent);

      // Delta tries to modify and remove non-existent requirement
      const deltaContent = `# Gamma - Changes

## 修改需求
### 需求： Missing
new text

## 移除需求
### 需求： Another Missing`;
      await fs.writeFile(path.join(changeSpecDir, 'spec.md'), deltaContent);

      await archiveCommand.execute(changeName, { yes: true, noValidate: true });

      // Should not change the main spec and should not archive the change dir
      const still = await fs.readFile(path.join(mainSpecDir, 'spec.md'), 'utf-8');
      expect(still).toBe(mainContent);
      // Change dir should still exist since operation aborted
      await expect(fs.access(changeDir)).resolves.not.toThrow();
    });

    it('should require MODIFIED to reference the NEW header when a rename exists (error format)', async () => {
      const changeName = 'rename-modify-new-header';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      const changeSpecDir = path.join(changeDir, 'specs', 'delta');
      await fs.mkdir(changeSpecDir, { recursive: true });

      // Main spec with Old
      const mainSpecDir = path.join(tempDir, 'openspec', 'specs', 'delta');
      await fs.mkdir(mainSpecDir, { recursive: true });
      const mainContent = `# delta Specification

## Purpose
Delta purpose.

## 需求

### 需求： Old
old body`;
      await fs.writeFile(path.join(mainSpecDir, 'spec.md'), mainContent);

      // Delta: rename Old->New, but MODIFIED references Old (should abort)
      const badDelta = `# Delta - Changes

## 重命名需求
- FROM: \`### 需求： Old\`
- TO: \`### 需求： New\`

## 修改需求
### 需求： Old
new body`;
      await fs.writeFile(path.join(changeSpecDir, 'spec.md'), badDelta);

      await archiveCommand.execute(changeName, { yes: true, noValidate: true });
      const unchanged = await fs.readFile(path.join(mainSpecDir, 'spec.md'), 'utf-8');
      expect(unchanged).toBe(mainContent);
      // Assert error message format and abort notice
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('验证失败 - 当存在重命名时，"修改需求"必须引用新标题')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('已中止。未更改任何文件。')
      );

      // Fix MODIFIED to reference New (should succeed)
      const goodDelta = `# Delta - Changes

## 重命名需求
- FROM: \`### 需求： Old\`
- TO: \`### 需求： New\`

## 修改需求
### 需求： New
new body`;
      await fs.writeFile(path.join(changeSpecDir, 'spec.md'), goodDelta);

      await archiveCommand.execute(changeName, { yes: true, noValidate: true });
      const updated = await fs.readFile(path.join(mainSpecDir, 'spec.md'), 'utf-8');
      expect(updated).toContain('### 需求： New');
      expect(updated).toContain('new body');
      expect(updated).not.toContain('### 需求： Old');
    });

    it('should process multiple specs atomically (any failure aborts all)', async () => {
      const changeName = 'multi-spec-atomic';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      const spec1Dir = path.join(changeDir, 'specs', 'epsilon');
      const spec2Dir = path.join(changeDir, 'specs', 'zeta');
      await fs.mkdir(spec1Dir, { recursive: true });
      await fs.mkdir(spec2Dir, { recursive: true });

      // Existing main specs
      const epsilonMain = path.join(tempDir, 'openspec', 'specs', 'epsilon', 'spec.md');
      await fs.mkdir(path.dirname(epsilonMain), { recursive: true });
      await fs.writeFile(epsilonMain, `# epsilon Specification

## Purpose
Epsilon purpose.

## 需求

### 需求： E1
e1`);

      const zetaMain = path.join(tempDir, 'openspec', 'specs', 'zeta', 'spec.md');
      await fs.mkdir(path.dirname(zetaMain), { recursive: true });
      await fs.writeFile(zetaMain, `# zeta Specification

## Purpose
Zeta purpose.

## 需求

### 需求： Z1
z1`);

      // Delta: epsilon is valid modification; zeta tries to remove non-existent -> should abort both
      await fs.writeFile(path.join(spec1Dir, 'spec.md'), `# Epsilon - Changes

## 修改需求
### 需求： E1
E1 updated`);

      await fs.writeFile(path.join(spec2Dir, 'spec.md'), `# Zeta - Changes

## 移除需求
### 需求： Missing`);

      await archiveCommand.execute(changeName, { yes: true, noValidate: true });

      const e1 = await fs.readFile(epsilonMain, 'utf-8');
      const z1 = await fs.readFile(zetaMain, 'utf-8');
      expect(e1).toContain('### 需求： E1');
      expect(e1).not.toContain('E1 updated');
      expect(z1).toContain('### 需求： Z1');
      // changeDir should still exist
      await expect(fs.access(changeDir)).resolves.not.toThrow();
    });

    it('should display aggregated totals across multiple specs', async () => {
      const changeName = 'multi-spec-totals';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      const spec1Dir = path.join(changeDir, 'specs', 'omega');
      const spec2Dir = path.join(changeDir, 'specs', 'psi');
      await fs.mkdir(spec1Dir, { recursive: true });
      await fs.mkdir(spec2Dir, { recursive: true });

      // Existing main specs
      const omegaMain = path.join(tempDir, 'openspec', 'specs', 'omega', 'spec.md');
      await fs.mkdir(path.dirname(omegaMain), { recursive: true });
      await fs.writeFile(omegaMain, `# omega Specification\n\n## Purpose\nOmega purpose.\n\n## 需求\n\n### 需求： O1\no1`);

      const psiMain = path.join(tempDir, 'openspec', 'specs', 'psi', 'spec.md');
      await fs.mkdir(path.dirname(psiMain), { recursive: true });
      await fs.writeFile(psiMain, `# psi Specification\n\n## Purpose\nPsi purpose.\n\n## 需求\n\n### 需求： P1\np1`);

      // Deltas: omega add one, psi rename and modify -> totals: +1, ~1, -0, →1
      await fs.writeFile(path.join(spec1Dir, 'spec.md'), `# Omega - Changes\n\n## 新增需求\n\n### 需求： O2\nnew`);
      await fs.writeFile(path.join(spec2Dir, 'spec.md'), `# Psi - Changes\n\n## 重命名需求\n- FROM: \`### 需求： P1\`\n- TO: \`### 需求： P2\`\n\n## 修改需求\n### 需求： P2\nupdated`);

      await archiveCommand.execute(changeName, { yes: true, noValidate: true });

      // Verify aggregated totals line was printed
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('总计：+ 1 新增，~ 1 修改，- 0 删除，→ 1 重命名')
      );
    });
  });

  describe('error handling', () => {
    it('should throw error when openspec directory does not exist', async () => {
      // Remove openspec directory
      await fs.rm(path.join(tempDir, 'openspec'), { recursive: true });
      
      await expect(
        archiveCommand.execute('any-change', { yes: true })
      ).rejects.toThrow("未找到OpenSpec更改目录。请先运行 'openspec-cn init'。");
    });
  });

  describe('interactive mode', () => {
    it('should use select prompt for change selection', async () => {
      const { select } = await import('@inquirer/prompts');
      const mockSelect = select as unknown as ReturnType<typeof vi.fn>;
      
      // Create test changes
      const change1 = 'feature-a';
      const change2 = 'feature-b';
      await fs.mkdir(path.join(tempDir, 'openspec', 'changes', change1), { recursive: true });
      await fs.mkdir(path.join(tempDir, 'openspec', 'changes', change2), { recursive: true });
      
      // Mock select to return first change
      mockSelect.mockResolvedValueOnce(change1);
      
      // Execute without change name
      await archiveCommand.execute(undefined, { yes: true });
      
      // Verify select was called with correct options (values matter, names may include progress)
      expect(mockSelect).toHaveBeenCalledWith(expect.objectContaining({
        message: '选择要归档的更改',
        choices: expect.arrayContaining([
          expect.objectContaining({ value: change1 }),
          expect.objectContaining({ value: change2 })
        ])
      }));
      
      // Verify the selected change was archived
      const archiveDir = path.join(tempDir, 'openspec', 'changes', 'archive');
      const archives = await fs.readdir(archiveDir);
      expect(archives[0]).toContain(change1);
    });

    it('should use confirm prompt for task warnings', async () => {
      const { confirm } = await import('@inquirer/prompts');
      const mockConfirm = confirm as unknown as ReturnType<typeof vi.fn>;
      
      const changeName = 'incomplete-interactive';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      await fs.mkdir(changeDir, { recursive: true });
      
      // Create tasks.md with incomplete tasks
      const tasksContent = '- [ ] Task 1';
      await fs.writeFile(path.join(changeDir, 'tasks.md'), tasksContent);
      
      // Mock confirm to return true (proceed)
      mockConfirm.mockResolvedValueOnce(true);
      
      // Execute without --yes flag
      await archiveCommand.execute(changeName);
      
      // Verify confirm was called
      expect(mockConfirm).toHaveBeenCalledWith({
        message: expect.stringContaining('未完成任务'),
        default: false
      });
    });

    it('should cancel when user declines task warning', async () => {
      const { confirm } = await import('@inquirer/prompts');
      const mockConfirm = confirm as unknown as ReturnType<typeof vi.fn>;
      
      const changeName = 'cancel-test';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      await fs.mkdir(changeDir, { recursive: true });
      
      // Create tasks.md with incomplete tasks
      const tasksContent = '- [ ] Task 1';
      await fs.writeFile(path.join(changeDir, 'tasks.md'), tasksContent);
      
      // Mock confirm to return false (cancel) for validation skip
      mockConfirm.mockResolvedValueOnce(false);
      // Mock another false for task warning
      mockConfirm.mockResolvedValueOnce(false);
      
      // Execute without --yes flag but skip validation to test task warning
      await archiveCommand.execute(changeName, { noValidate: true });
      
      // Verify archive was cancelled
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('已取消'));
      
      // Verify change was not archived
      await expect(fs.access(changeDir)).resolves.not.toThrow();
    });
  });
});
