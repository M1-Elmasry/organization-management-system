import { MongoClient } from 'mongodb';
import { DB_HOST, DB_PORT, DB_NAME } from '../utils/constants';
import type { Db, Collection } from 'mongodb';
import type { UserDocument } from '../types/user';
import type { OrganizationDocument } from '../types/organizations';

class DBClient {
  readonly host: string;
  readonly port: string;
  readonly databaseName: string;

  public client: MongoClient | null = null;
  public db: Db | null = null;
  public userCollection: Collection<UserDocument> | null = null;
  public organizationCollection: Collection<OrganizationDocument> | null = null;

  constructor(host?: string, port?: string, databaseName?: string) {
    this.host = host || DB_HOST;
    this.port = port || DB_PORT;
    this.databaseName = databaseName || DB_NAME;

    MongoClient.connect(`mongodb://${this.host}:${this.port}`)
      .then((client: MongoClient) => {
        this.client = client;
        this.db = this.client.db(this.databaseName);
        this.userCollection = this.db.collection('users');
        this.organizationCollection = this.db.collection('organizations');
        console.log(`db connected on ${this.host}:${this.port}`);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  closeConnection() {
    if (!this.client) {
      throw new Error('cannot close database connection before connecting');
    }
    this.client.close();
    console.log('db connection closed');
  }
}

const dbClient = new DBClient();
export default dbClient;
