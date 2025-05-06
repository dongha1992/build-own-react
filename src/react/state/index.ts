import { FiberNode } from '../type.ts';

export class RendererState {
  private _workInProgressFiberRoot: FiberNode | null = null;
  private _nextUnitOfWork: FiberNode | null = null;
  private _currentRoot: FiberNode | null = null; // 현재 DOM과 동기화된 Fiber (마지막으로 DOM에 반영한 Fiber 트리)
  private _deletions: FiberNode[] = [];
  private _workInProgressFiber: FiberNode | null = null;
  private _hookIndex: number = 0;

  reset() {
    this._workInProgressFiberRoot = null;
    this._nextUnitOfWork = null;
    this._currentRoot = null;
    this._deletions = [];
    this._workInProgressFiber = null;
    this._hookIndex = 0;
  }

  get workInProgressFiberRoot(): FiberNode | null {
    return this._workInProgressFiberRoot;
  }
  set workInProgressFiberRoot(value: FiberNode | null) {
    this._workInProgressFiberRoot = value;
  }

  get nextUnitOfWork(): FiberNode | null {
    return this._nextUnitOfWork;
  }
  set nextUnitOfWork(value: FiberNode | null) {
    this._nextUnitOfWork = value;
  }

  get currentRoot(): FiberNode | null {
    return this._currentRoot;
  }
  set currentRoot(value: FiberNode | null) {
    this._currentRoot = value;
  }

  get deletions(): FiberNode[] {
    return this._deletions;
  }
  set deletions(value: FiberNode[]) {
    this._deletions = value;
  }

  get workInProgressFiber(): FiberNode | null {
    return this._workInProgressFiber;
  }
  set workInProgressFiber(value: FiberNode | null) {
    this._workInProgressFiber = value;
  }

  get hookIndex(): number {
    return this._hookIndex;
  }
  set hookIndex(value: number) {
    this._hookIndex = value;
  }
}
