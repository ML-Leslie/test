import { branchPoints, rightNumber, wrongNumber, history } from '../../src/node_modules/@sudoku/stores/branchPoints';
import { get } from 'svelte/store';

describe('Backtracking Algorithm', () => {
  // 每个测试前重置状态
    beforeEach(() => {
        branchPoints.reset();
        history.reset(); // 添加此行以重置历史记录
    });  

  test('应该能正确添加分支点', () => {
    // 模拟添加分支点
    branchPoints.add(0);
    branchPoints.add(1);
    
    // 验证分支点是否正确添加
    let points = get(branchPoints);
    expect(points).toHaveLength(2);
    expect(points).toContain(0);
    expect(points).toContain(1);
  });

  test('应该能正确删除分支点', () => {
    // 先添加几个分支点
    branchPoints.add(0);
    branchPoints.add(1);
    branchPoints.add(2);
    
    // 删除一个分支点
    branchPoints.remove(1);
    
    // 验证分支点是否正确删除
    let points = get(branchPoints);
    expect(points).toHaveLength(2);
    expect(points).toContain(0);
    expect(points).toContain(2);
    expect(points).not.toContain(1);
  });

  test('应该能记录正确和错误猜测的次数', () => {
    // 初始状态下正确和错误次数应为0
    expect(get(rightNumber)).toBe(0);
    expect(get(wrongNumber)).toBe(0);
    
    // 模拟正确猜测
    rightNumber.set(get(rightNumber) + 1);
    expect(get(rightNumber)).toBe(1);
    
    // 模拟错误猜测
    wrongNumber.set(get(wrongNumber) + 1);
    expect(get(wrongNumber)).toBe(1);
    
    // 再次增加正确猜测
    rightNumber.set(get(rightNumber) + 1);
    expect(get(rightNumber)).toBe(2);
  });

  test('重置功能应该清除所有分支点和计数器', () => {
    // 添加分支点和计数
    branchPoints.add(0);
    rightNumber.set(3);
    wrongNumber.set(2);
    
    // 重置
    branchPoints.reset();
    
    // 验证状态是否重置
    expect(get(branchPoints)).toHaveLength(0);
    expect(get(rightNumber)).toBe(0);
    expect(get(wrongNumber)).toBe(0);
  });

  test('模拟回溯算法解决数独', () => {
    // 模拟数独解题过程中的回溯
    // 1. 首先尝试某个单元格的一个可能值
    history.add({x: 0, y: 0}); // 假设在(0,0)位置填入数字
    branchPoints.add(0); // 标记这是一个分支点
    
    // 2. 继续填充其他单元格
    history.add({x: 1, y: 0}); 
    history.add({x: 0, y: 1});
    
    // 3. 发现矛盾，需要回溯到分支点
    // 假设在填了3个单元格后发现矛盾，需要回溯
    wrongNumber.set(get(wrongNumber) + 1); // 记录一次错误
    
    // 模拟回溯操作：删除从分支点开始的所有历史记录
    history.remove({x: 0, y: 1});
    history.remove({x: 1, y: 0});
    history.remove({x: 0, y: 0});
    
    // 4. 尝试另一个候选值
    history.add({x: 0, y: 0}); // 重新在(0,0)位置填入不同的数字
    branchPoints.add(0); // 再次标记分支点
    
    // 继续填充，假设这次成功
    history.add({x: 1, y: 0});
    history.add({x: 0, y: 1});
    rightNumber.set(get(rightNumber) + 1); // 记录一次正确
    
    // 验证最终状态
    expect(get(history)).toHaveLength(3);
    expect(get(rightNumber)).toBe(1);
    expect(get(wrongNumber)).toBe(1);
  });
  
  test('复杂数独中的回溯性能', () => {
    // 模拟一个需要多次回溯的复杂数独
    const steps = 20; // 模拟需要20步解题
    const wrongGuesses = 5; // 其中有5次错误猜测需要回溯
    
    // 为简化测试，我们只记录结果
    for (let i = 0; i < steps; i++) {
      history.add({x: Math.floor(i/9), y: i%9}); // 模拟填充单元格
      
      // 每4步添加一个分支点
      if (i % 4 === 0) {
        branchPoints.add(i);
      }
    }
    
    // 记录猜测次数
    rightNumber.set(steps - wrongGuesses);
    wrongNumber.set(wrongGuesses);
    
    // 验证最终状态
    expect(get(history)).toHaveLength(steps);
    expect(get(rightNumber)).toBe(steps - wrongGuesses);
    expect(get(wrongNumber)).toBe(wrongGuesses);
    expect(get(branchPoints).length).toBeGreaterThan(0);
  });
});
