import { record, canUndo, canRedo } from '../../src/node_modules/@sudoku/stores/record';
import { get } from 'svelte/store';

describe('Undo and Redo Functionality', () => {
  let initialState;
  
  beforeEach(() => {
    // 重置撤销/重做堆栈
    record.reset();
    initialState = [
      { row: 0, col: 2, value: 0 },
      { row: 1, col: 3, value: 1 }
    ];
  });
  
  test('应该能够记录状态变化', () => {
    // 创建一个新的操作状态
    const newAction = [
      { row: 0, col: 2, oldValue: 0, newValue: 4 }
    ];
    
    record.do(newAction);
    expect(get(canUndo)).toBe(true);
    expect(get(canRedo)).toBe(false);
  });
  
  test('应该能够撤销操作', () => {
    // 创建并保存新操作
    const action = [
      { row: 0, col: 2, oldValue: 0, newValue: 4 }
    ];
    record.do(action);
    
    // 撤销并检查状态
    const undoAction = record.undo();
    expect(undoAction).toEqual(action);
    expect(get(canUndo)).toBe(false);
    expect(get(canRedo)).toBe(true);
  });
  
  test('应该能够重做撤销的操作', () => {
    // 创建并保存新操作
    const action = [
      { row: 0, col: 2, oldValue: 0, newValue: 4 }
    ];
    record.do(action);
    
    // 撤销然后重做
    record.undo();
    const redoAction = record.redo();
    
    expect(redoAction).toEqual(action);
    expect(get(canUndo)).toBe(true);
    expect(get(canRedo)).toBe(false);
  });
  
  test('多步撤销和重做应该按正确顺序工作', () => {
    // 保存多个操作状态
    const action1 = [
      { row: 0, col: 2, oldValue: 0, newValue: 1 }
    ];
    record.do(action1);
    
    const action2 = [
      { row: 0, col: 3, oldValue: 0, newValue: 2 }
    ];
    record.do(action2);
    
    const action3 = [
      { row: 0, col: 4, oldValue: 7, newValue: 3 }
    ];
    record.do(action3);
    
    // 测试多步撤销
    let lastAction = record.undo(); // 撤销action3
    expect(lastAction).toEqual(action3);
    
    lastAction = record.undo(); // 撤销action2
    expect(lastAction).toEqual(action2);
    
    // 测试多步重做
    lastAction = record.redo(); // 重做action2
    expect(lastAction).toEqual(action2);
    
    lastAction = record.redo(); // 重做action3
    expect(lastAction).toEqual(action3);
  });
  
  test('在新操作后重置重做堆栈', () => {
    // 执行两个操作
    const action1 = [{ row: 0, col: 2, oldValue: 0, newValue: 1 }];
    const action2 = [{ row: 0, col: 3, oldValue: 0, newValue: 2 }];
    
    record.do(action1);
    record.do(action2);
    
    // 撤销一次
    record.undo();
    expect(get(canRedo)).toBe(true);
    
    // 执行新操作
    const action3 = [{ row: 0, col: 5, oldValue: 0, newValue: 6 }];
    record.do(action3);
    
    // 确认重做堆栈已重置
    expect(get(canRedo)).toBe(false);
  });
  
  test('update 方法应该更新状态并记录历史', () => {
    // 设置初始状态
    record.update(() => initialState);
    
    // 使用 update 更新状态
    const newState = [...initialState, { row: 2, col: 2, value: 5 }];
    record.update(() => newState);
    
    expect(get(canUndo)).toBe(true);
    
    // 撤销并验证返回到初始状态
    const undoState = record.undo();
    expect(undoState).toEqual(initialState);
  });
  
  test('reset 方法应该清空历史记录', () => {
    // 创建几个操作
    const action1 = [{ row: 0, col: 2, oldValue: 0, newValue: 1 }];
    const action2 = [{ row: 0, col: 3, oldValue: 0, newValue: 2 }];
    
    record.do(action1);
    record.do(action2);
    record.undo(); // 撤销一次让 canRedo 为 true
    
    // 确认状态
    expect(get(canUndo)).toBe(true);
    expect(get(canRedo)).toBe(true);
    
    // 重置并验证
    record.reset();
    expect(get(canUndo)).toBe(false);
    expect(get(canRedo)).toBe(false);
  });
});
