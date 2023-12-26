export default abstract class Seeder {
  /**
   * Insert documents into database
  */
  abstract run(): Promise<void>;
  
  /**
   * Call other seeders
  */
  async call(seeders: typeof Seeder[]) {
    for(const Seeder of seeders) {
      const seeder = new Seeder();
      await seeder.run();
    }
  }
}