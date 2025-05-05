import { FiberNode } from '../type.ts';

export class RendererState {
  private _currentWorkingFiberRoot: FiberNode | null = null;
  private _nextUnitOfWork: FiberNode | null = null;
  private _currentRoot: FiberNode | null = null; // 현재 DOM과 동기화된 Fiber
  private _deletions: FiberNode[] = [];
  private _currentWorkingFiber: FiberNode | null = null;
  private _hookIndex: number = 0;

  reset() {
    this._currentWorkingFiberRoot = null;
    this._nextUnitOfWork = null;
    this._currentRoot = null;
    this._deletions = [];
    this._currentWorkingFiber = null;
    this._hookIndex = 0;
  }

  get currentWorkingFiberRoot(): FiberNode | null {
    return this._currentWorkingFiberRoot;
  }
  set currentWorkingFiberRoot(value: FiberNode | null) {
    this._currentWorkingFiberRoot = value;
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

  get currentWorkingFiber(): FiberNode | null {
    return this._currentWorkingFiber;
  }
  set currentWorkingFiber(value: FiberNode | null) {
    this._currentWorkingFiber = value;
  }

  get hookIndex(): number {
    return this._hookIndex;
  }
  set hookIndex(value: number) {
    this._hookIndex = value;
  }
}
