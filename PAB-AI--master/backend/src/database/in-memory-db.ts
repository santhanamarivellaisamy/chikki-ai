import { User, RefreshToken } from '../models/user.model';

export class InMemoryDB {
  public static users: User[] = [];
  public static refreshTokens: RefreshToken[] = [];
  public static folders: any[] = [];
  public static conversations: any[] = [];
  public static messages: any[] = [];
  public static prompts: any[] = [];
  public static promptVersions: any[] = [];

  public static clear(): void {
    InMemoryDB.users = [];
    InMemoryDB.refreshTokens = [];
    InMemoryDB.folders = [];
    InMemoryDB.conversations = [];
    InMemoryDB.messages = [];
    InMemoryDB.prompts = [];
    InMemoryDB.promptVersions = [];
  }
}
