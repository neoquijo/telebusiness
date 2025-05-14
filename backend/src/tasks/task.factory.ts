import { Injectable } from '@nestjs/common';
import { TaskType, Task } from './models/task.schema';
import { TelegramClientFactory } from 'src/telegram/telegram';
import { AccountsService } from 'src/accounts/accounts.service';
import { TasksService } from './tasks.service';

interface TaskConfig {
  name: string;
  type: TaskType;
  accountIds: string[];
  userId: string;
  config: Record<string, any>;
}

@Injectable()
export class TaskFactory {
  private activeTasks: Map<string, any> = new Map();

  constructor(
    private readonly tasksService: TasksService,
    // private readonly telegramClientFactory: TelegramClientFactory = new TelegramClientFactory,
    // private readonly accountsService: AccountsService,
  ) { }

  async createTask(taskConfig: TaskConfig): Promise<Task> {
    // Create task in database
    const task = await this.tasksService.create({
      name: taskConfig.name,
      type: taskConfig.type,
      accounts: taskConfig.accountIds,
      user: taskConfig.userId,
      config: taskConfig.config,
      status: 'stopped',
    });

    return task;
  }

  async startTask(taskId: string): Promise<Task> {
    const task = await this.tasksService.findById(taskId);
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    if (task.status === 'running') {
      throw new Error(`Task with id ${taskId} is already running`);
    }

    // Load accounts for this task
    const accounts = []
    // await this.accountsService.findByIds(task.accounts);

    // Initialize telegram clients for each account if needed
    const clients = await Promise.all(
      accounts.map(async (account) => {
        try {
          let client = await TelegramClientFactory.getClient(account.id);
          return client;
        } catch (error) {
          console.error(`Failed to initialize client for account ${account.id}:`, error);
          return null;
        }
      })
    );

    // Filter out failed clients
    const validClients = clients.filter(client => client !== null);

    if (validClients.length === 0) {
      await this.tasksService.update(taskId, { status: 'error', error: 'No valid accounts available' });
      throw new Error('Failed to start task: No valid accounts available');
    }

    // Create and store task runner based on type
    let taskRunner;
    if (task.type === 'parser') {
      taskRunner = new ParserTaskRunner(task, validClients, this.tasksService);
    } else if (task.type === 'sender') {
      taskRunner = new SenderTaskRunner(task, validClients, this.tasksService);
    } else {
      throw new Error(`Unknown task type: ${task.type}`);
    }

    // Store active task
    this.activeTasks.set(taskId, taskRunner);

    // Start task execution
    await taskRunner.start();

    // Update task status
    return this.tasksService.update(taskId, { status: 'running', lastExecutedAt: new Date() });
  }

  async stopTask(taskId: string): Promise<Task> {
    const taskRunner = this.activeTasks.get(taskId);
    if (!taskRunner) {
      throw new Error(`Task with id ${taskId} is not running`);
    }

    await taskRunner.stop();
    this.activeTasks.delete(taskId);

    return this.tasksService.update(taskId, { status: 'stopped' });
  }

  async pauseTask(taskId: string): Promise<Task> {
    const taskRunner = this.activeTasks.get(taskId);
    if (!taskRunner) {
      throw new Error(`Task with id ${taskId} is not running`);
    }

    await taskRunner.pause();

    return this.tasksService.update(taskId, { status: 'paused' });
  }

  async resumeTask(taskId: string): Promise<Task> {
    const task = await this.tasksService.findById(taskId);
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    if (task.status !== 'paused') {
      throw new Error(`Task with id ${taskId} is not paused`);
    }

    const taskRunner = this.activeTasks.get(taskId);
    if (!taskRunner) {
      return this.startTask(taskId);
    }

    await taskRunner.resume();

    return this.tasksService.update(taskId, { status: 'running' });
  }

  getActiveTask(taskId: string) {
    return this.activeTasks.get(taskId);
  }

  getAllActiveTasks() {
    return Array.from(this.activeTasks.entries()).map(([id, task]) => ({
      id,
      task,
    }));
  }
}

// Abstract base class for task runners
abstract class TaskRunner {
  protected running: boolean = false;

  constructor(
    protected task: Task,
    protected clients: any[],
    protected tasksService: TasksService,
  ) { }

  async start(): Promise<void> {
    this.running = true;
    try {
      await this.execute();
    } catch (error) {
      await this.tasksService.update(this.task.id, {
        status: 'error',
        error: error.message || 'Unknown error during task execution'
      });
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.running = false;
  }

  async pause(): Promise<void> {
    this.running = false;
  }

  async resume(): Promise<void> {
    this.running = true;
    await this.execute();
  }

  abstract execute(): Promise<void>;
}

// Implementation for parser tasks
class ParserTaskRunner extends TaskRunner {
  async execute(): Promise<void> {
    // Implementation for parsing logic
    console.log(`Starting parser task ${this.task.id} with ${this.clients.length} clients`);

    // Do parsing work here
    // This is just a placeholder - real implementation would depend on your needs

    // Update task status when complete
    if (this.running) {
      await this.tasksService.update(this.task.id, {
        status: 'completed',
        lastExecutedAt: new Date()
      });
    }
  }
}

// Implementation for sender tasks
class SenderTaskRunner extends TaskRunner {
  async execute(): Promise<void> {
    // Implementation for sending logic
    console.log(`Starting sender task ${this.task.id} with ${this.clients.length} clients`);

    // Do sending work here
    // This is just a placeholder - real implementation would depend on your needs

    // Update task status when complete
    if (this.running) {
      await this.tasksService.update(this.task.id, {
        status: 'completed',
        lastExecutedAt: new Date()
      });
    }
  }
}