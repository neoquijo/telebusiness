import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskStatus, TaskType } from './models/task.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
  ) { }

  async create(taskData: {
    name: string;
    type: TaskType;
    accounts: string[];
    user: string;
    config: Record<string, any>;
    status: TaskStatus;
  }): Promise<Task> {
    const newTask = new this.taskModel({
      ...taskData,
      accounts: taskData.accounts.map(id => new Types.ObjectId(id)),
      user: new Types.ObjectId(taskData.user),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return newTask.save();
  }

  async findAll(filter: Partial<{
    user: string;
    type: TaskType;
    status: TaskStatus;
  }> = {}): Promise<Task[]> {
    const query: any = {};

    if (filter.user) {
      query.user = new Types.ObjectId(filter.user);
    }

    if (filter.type) {
      query.type = filter.type;
    }

    if (filter.status) {
      query.status = filter.status;
    }

    return this.taskModel.find(query)
      .populate('accounts')
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Task> {
    return this.taskModel.findById(id)
      .populate('accounts')
      .populate('user', 'username email')
      .exec();
  }

  async update(id: string, updateData: Partial<Task>): Promise<Task> {
    const updatedTask = await this.taskModel.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true },
    )
      .populate('accounts')
      .populate('user', 'username email')
      .exec();

    return updatedTask;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.taskModel.deleteOne({ _id: new Types.ObjectId(id) }).exec();
    return result.deletedCount > 0;
  }

  async updateProcessedItems(id: string, count: number): Promise<Task> {
    return this.taskModel.findByIdAndUpdate(
      id,
      {
        $inc: { processedItems: count },
        updatedAt: new Date()
      },
      { new: true }
    ).exec();
  }
}