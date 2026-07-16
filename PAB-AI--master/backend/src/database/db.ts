import { isMockMode } from '../config/supabase';
import { IUserRepository } from './user.repository';
import { InMemoryUserRepository } from './in-memory-user.repository';
import { SupabaseUserRepository } from './supabase-user.repository';
import { IChatRepository } from './chat.repository';
import { InMemoryChatRepository } from './in-memory-chat.repository';
import { SupabaseChatRepository } from './supabase-chat.repository';
import { IPromptRepository } from './prompt.repository';
import { InMemoryPromptRepository } from './in-memory-prompt.repository';
import { SupabasePromptRepository } from './supabase-prompt.repository';

export let userRepository: IUserRepository;
export let chatRepository: IChatRepository;
export let promptRepository: IPromptRepository;

if (isMockMode) {
  userRepository = new InMemoryUserRepository();
  chatRepository = new InMemoryChatRepository();
  promptRepository = new InMemoryPromptRepository();
} else {
  userRepository = new SupabaseUserRepository();
  chatRepository = new SupabaseChatRepository();
  promptRepository = new SupabasePromptRepository();
}
