import { Module } from "./Module";

export class ModuleRegistry {
  private static instance: ModuleRegistry;
  private modules: Module[] = [];

  private constructor() { }

  static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  registerModule(module: Module) {
    module.register();
    this.modules.push(module);
  }

  registerModules(modules: Module[]) {
    modules.forEach(module => {
      module.register();
      this.modules.push(module);
    });
  }

  getAllRoutes() {
    return this.modules.flatMap(module => module.getRoutes());
  }
}
