import { Command } from "samer-artisan";
import Job from "~/core/abstract/Job";
import Queue from "Queue";
import { readdir } from "fs/promises";
import DB from "DB";


export default class QueueWorker extends Command {
  signature = "queue:work";
  
  handle(){
    return new Promise(async () => {
      await DB.connect();
      await this.setupJobs();
      this.subscribeListeners();
      this.info("listening for jobs...\n\n");
    });
  }
  
  private subscribeListeners() {
    Queue.on('failed', (job, err) => {
      console.log(`Job ${job.name} failed for: ${err.stack}\n\n`);
    });
    
    this.option("verbose") && Queue.on('completed', (job) => {
      const formatedDate = Date().toLocaleTimeString("en-US", { hour12: true });
      this.info(`[${formatedDate}] Processed: ${job.name} \n`);
    });
  }
  
  private async setupJobs() {
    const jobFiles = await readdir("app/jobs");
    await jobFiles.map(async jobFileName => {
      const jobName = jobFileName.split(".")[0];
      const job = await importDefault<Job>("~/app/jobs/" + jobName);
      const processor = (task: any) => job.handle(task.data);
      Queue.channel(job.channel).process(job.constructor.name, job.concurrency, processor);
    });
  }
}