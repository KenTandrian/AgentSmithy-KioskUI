// Copyright 2025 Google LLC. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { Injectable } from '@angular/core';
import { HttpClient, HttpDownloadProgressEvent, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { CreateChatRequest } from '../models/chat.model';
import { SessionService } from './session.service';
import { Message as ChatMessage } from '../models/messegeType.model';
import { Message } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient, private sessionService: SessionService) {}

  postChat(conversation: ChatMessage[], chatsUrl: string): Observable<HttpEvent<string>> {
    if (!this.sessionService.getSession()) {
      this.sessionService.createSession();
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    let messages: Message[] = []

    conversation.reverse().filter(message => message.type !== 'bot' ? true : message.botAnswer ).forEach(message => {
      messages.push(
        {
          content: message.type === 'bot' ? message.botAnswer!.replace(/\s+/g, " ").trim() : message.body.replace(/\s+/g, " ").trim(),
          type: message.type === 'bot' ? 'ai' : 'human',
        }
      )
    })
    const body: CreateChatRequest = {
      input: {
        input: {
          messages: messages,
          session_id: this.sessionService.getSession()!,
        }
      }
    };

    return this.http
      .post(chatsUrl, body, {
        headers,
        observe: "events",
        responseType: "text",
        reportProgress: true,
      })
  }
}