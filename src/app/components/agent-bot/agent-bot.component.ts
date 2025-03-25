import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, ReplaySubject, timeout } from 'rxjs';
import { Message, SuggestionData } from '../../models/messegeType.model';
import { ChatService } from '../../services/chat.service';
import { BroadcastService } from '../../services/broadcast.service';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { SpeechToTextService } from '../../services/speech-to-text';
import { HttpClient, HttpDownloadProgressEvent, HttpEvent, HttpEventType } from '@angular/common/http';
import { Chat, ChatEvent } from '../../models/chat.model';
import { HowItWorksDialogComponent } from '../how-it-works-dialog/how-it-works-dialog.component';


export type DialogQuestion = {
  questionId: string,
  questionText: string,
  hasChip: boolean,
  options: string[],
  questionSequence: string,
  answer: string
}

@Component({
  selector: 'app-agent-bot',
  templateUrl: './agent-bot.component.html',
  styleUrl: './agent-bot.component.scss'
})
export class AgentBotComponent implements OnInit, OnDestroy {
  @Output() onSubmit: EventEmitter<any> = new EventEmitter();

  isSuggestedQuestion: string = '';
  chatQuery: string
  chatQuery$: Observable<Message>;
  showLoader: boolean = false;
  startTimer: boolean = false;
  conversation: Message[] = [];
  leftContainerClass = "";
  rightContainerClass = "";
  index = 2;
  loaderTextArray: string[] = [
    "I am a conversation bot built on Google Cloud's Vertex AI tools.",
    "Tool Tip: You can reset the conversation anytime using the reset button next the the text input box.",
    "Joke : Why did the robot go on a diet? Because it had too many bytes!",
    "Joke : Why can't bicycles stand up by themselves? Because they are two-tired!",
    "Joke : How does a computer get drunk? It takes screenshots."
  ];
  loaderTextTimeout: undefined | ReturnType<typeof setTimeout>;
  loaderText = "";
  loaderTextIndex = 0;
  loaderIndex = 1;
  isChatDisabled: boolean = false;
  botStartTime: number;
  initialQuestion: string;
  ticketId: string;
  categoryIntent: string = "";
  changeImageInterval: undefined | ReturnType<typeof setTimeout>;
  panelOpenState = false;
  like = false;
  dislike = false;
  response: Response
  loaderSelectedChip = '';
  showLoaderLikeDislikeButtons = false;
  outOfContextAnswerResponseObject = {
    like: false,
    dislike: false
  }
  showSuggesstion = false;
  suggestedQuestionMessage: Message;
  loader_chat_id: any;
  questionArray: any[] = [];

  /** DEP accordion border colors */
  borderColors = ['#4285F4', '#0F9D58', '#F4B400', '#DB4437'];

  private readonly destroyed = new ReplaySubject<void>(1);
  isRecording = false;
  transcribedText = '';
  mediaRecorder: MediaRecorder;
  audioChunks: Blob[] = [];
  selectedAgentData:any;
  chatsUrl: string;
  botsMappingData: any;
  botsMap = new Map();
  botUrl: string;

  constructor(
    public dialog: MatDialog,
    private chatService: ChatService,
    public userService: UserService,
    private broadcastService: BroadcastService,
    private speechToTextService: SpeechToTextService,
    private router: Router,
    private httpClient: HttpClient
  ) {
    this.chatQuery$ = this.broadcastService.chatQuery$
    this.chatQuery$.subscribe((value: any) => {
      this.conversation.push(value);
    });
    this.loaderText = this.loaderTextArray[Math.round(Math.random() * 10)];
    this.checkIfMessege();
  }

  setupMediaRecorder(stream: MediaStream) {
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.ondataavailable = event => this.audioChunks.push(event.data);
    this.mediaRecorder.onstop = () => this.sendAudioToGCP();
  }

  async sendAudioToGCP() {
    const audioBlob = new Blob(this.audioChunks);
    (await this.speechToTextService.transcribeAudio(audioBlob)).subscribe(
      (response: any) => {
        this.chatQuery = response[0]
      },
      (error: any) => {
      }
    );
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  getStringData(obj: any): string {
    let str = (obj as string);
    if (str === "" || str.length === 0) {
      return "Sorry! I don't have sufficient information to answer this question at the moment.";
    }
    return (obj as string);
  }


  getSuggestionData(obj: any): SuggestionData {
    return (obj as SuggestionData);
  }

  checkIfMessege() {
    if (this.conversation.length == 1 && this.conversation[0].type == 'user') {
      this.showLoader = true;
      this.setTimeoutForLoaderText();
      this.setCyclicBackgroundImages();
      this.startTimer = true;
      this.botStartTime = new Date().getTime()
      this.initialQuestion = this.conversation[0].body;
      this.pushQuestion(this.initialQuestion);
      this.chatService.postChat(this.conversation[0].body, this.botUrl).subscribe({
        next: (event: HttpEvent<string>) => {
          if (event.type === HttpEventType.DownloadProgress) {
            this.handleBotResponse(
              (event as HttpDownloadProgressEvent).partialText + "…",
            );
          } else if (event.type === HttpEventType.Response) {
            this.handleBotResponse(event.body!);
          }
        },
        error: () => {
          console.log("Error getting stream events");
        },
      });
    }
  }

  pushQuestion(question: string, id?: any) {
    this.questionArray.push({ question, id });
  }

  assignId(id: any) {
    for (let i = 0; i < this.questionArray.length; i++) {
      if (!this.questionArray[i].id) {
        this.questionArray[i].id = id;
        break;
      }
    };
  }

  getQuestion(id: any) {
    const questionObj = this.questionArray.find(x => x.id === id);
    return questionObj?.question || '';
  }

  async submitMessage(event: any) {
    this.outOfContextAnswerResponseObject = {
      like: false,
      dislike: false
    };
    this.removeSuggestionElement();
    this.pushQuestion(this.chatQuery);

    this.botStartTime = new Date().getTime();
    // keeps the scrollbar to the bottom
    const parentElement = document.getElementsByClassName('chat-body');
    parentElement[0].scrollTo(0, parentElement[0].scrollHeight);

    if (event instanceof KeyboardEvent || event instanceof MouseEvent) {
      event.preventDefault();
    }
    if (!this.chatQuery || this.chatQuery === '') {
      return;
    }
    if (!this.initialQuestion) this.initialQuestion = this.chatQuery;

    let singleMessage: Message = {
      body: this.chatQuery,
      type: 'user',
      shareable: false,
    }

    this.conversation.unshift(singleMessage);
    this.chatQuery = '';
    this.showLoader = true;
    this.setTimeoutForLoaderText();
    this.setCyclicBackgroundImages();
    this.chatService.postChat(singleMessage.body, this.botUrl).subscribe({
      next: (event: HttpEvent<string>) => {
        if (event.type === HttpEventType.DownloadProgress) {
          this.handleBotResponse(
            (event as HttpDownloadProgressEvent).partialText as string
          );
        } else if (event.type === HttpEventType.Response) {
          this.handleBotResponse(event.body as string);
        }
      },
      error: () => {
        console.log("Error getting stream events");
      },
    });
  }

  setErrorMessage() {
    this.clearTimeoutForLoaderText();
    this.leftContainerClass = 'left-side-container-error';
    this.loaderText = 'Oops something went wrong , please try again.';
    this.rightContainerClass = 'right-side-container-error';
    this.showLoaderLikeDislikeButtons = false;
  }

  setAnswerNotFoundText(loaderText: string) {
    this.clearTimeoutForLoaderText();
    this.showLoader = true;
    this.leftContainerClass = 'answer-not-found';
    this.rightContainerClass = 'right-side-container-error';
    this.loaderText = loaderText + " Please try asking something else";
    this.showLoaderLikeDislikeButtons = true;
  }

  stopTicketCreationFlow() {
    this.isChatDisabled = false;
    this.chatQuery = '';
  }

  setCyclicBackgroundImages() {
    if (this.loaderTextIndex == 3) {
      this.loaderTextIndex = 0;
    }
    this.leftContainerClass = 'left-side-container-' + (this.loaderTextIndex + 1);
    this.rightContainerClass = 'right-side-container-' + (this.loaderTextIndex + 1);
    this.loaderTextIndex++;
  }

  setTimeoutForLoaderText() {
    this.loaderText = this.loaderTextArray[Math.round(Math.random() * 10)];
    this.showLoaderLikeDislikeButtons = false;
    this.loaderTextTimeout = setInterval(() => { this.setCyclicLoaderText(); }, 3000);
  }

  clearTimeoutForLoaderText() {
    clearTimeout(this.loaderTextTimeout);
  }

  setCyclicLoaderText() {
    this.loaderText = this.loaderTextArray[Math.round(Math.random() * 10)];
    this.loaderIndex++;
  }

  handleBotResponse(answer: string) {
    let events: string[] = answer.split("\n");

    // Filter out empty strings that might result from extra newlines.
    events = events.filter(event => event.trim() !== "");

    if (events.length === 0) {
        return;
    }
    
    try {
        let parsedEvent = JSON.parse(events[0]);
        let answerId = parsedEvent.agent.messages[0].kwargs.id; // Access the "id" from the kwargs

        if (answerId === this.conversation[0].chat_id) {
            // Process the *last* event.  Use .at(-1) for clarity and safety.
            const lastEventString = events.at(-1);
            if (!lastEventString) {
                console.warn("No last event found after splitting.");
                return; // Or handle the error appropriately
            }

            const lastEventParsed = JSON.parse(lastEventString);
            const lastMessage = lastEventParsed.agent.messages.at(-1);

            if (lastMessage && lastMessage.kwargs.type === "ai") {
                this.conversation[0].botAnswer += lastMessage.kwargs.content;
            }
            return;
        }

        let response: Chat = {
          id: answerId,
          question: this.chatQuery,
          answer: "",
          suggested_questions: []
        }
        
        let endTime = new Date().getTime();
        this.assignId(response?.id);
    
        let singleMesage: Message = {
          body: "",
          botAnswer: response.answer,
          type: 'bot',
          responseTime: ((endTime - this.botStartTime) / 1000).toString(),
          shareable: true,
          botStartTime: this.botStartTime.toString(),
          extras: {
            like: false,
            dislike: false,
            delete: false,
          },
          chat_id: response.id!
        };
    
        this.conversation.unshift(singleMesage);
        this.setSuggestedQuestionInChat(response, endTime);
        this.showLoader = false;
        this.clearTimeoutForLoaderText();
        this.isSuggestedQuestion = '';

    } catch (error) {
        console.error("Error parsing JSON:", error);
        console.error("Problematic event data:", answer); // Log the raw event data
        // Consider adding error handling here, such as retrying or logging.
    }
  }

  // adds Suggested question as another message
  setSuggestedQuestionInChat(response: Chat, endTime: number) {
    if (response.suggested_questions?.length || 0 > 0) {
      this.showSuggesstion = true;
      this.suggestedQuestionMessage = {
        body: "",
        type: 'bot',
        responseTime: ((endTime - this.botStartTime) / 1000).toString(),
        shareable: true,
        extras: {
          like: false,
          dislike: false
        },
        suggestedQuestion: response.suggested_questions
      }
      setTimeout(() => {
        const botResponseElement = document.getElementById(this.botStartTime.toString());
        const parentElement = document.getElementsByClassName('chat-body');
        const y = botResponseElement?.offsetTop;
        if (y) {
          parentElement[0].scroll({
            top: y - 30,
            behavior: 'smooth'
          })
        }
      }, 1000);
    }
  }

  chipControlOnSelect(event: any) {
    this.chatQuery = event.target.innerText;
    this.submitMessage(event);
  }

  getResponseforSuggestionQuery(event: any) {
    this.isSuggestedQuestion = event;
    this.chatQuery = event;
    document.querySelectorAll(".bot-suggestion-container").forEach(el => el.remove());
    this.submitMessage(event);
  }

  removeSuggestionElement() {
    this.showSuggesstion = false;
    document.querySelectorAll(".bot-suggestion-container").forEach(el => el.remove());
  }

  startRecording() {
    this.isRecording = true;
    this.audioChunks = [];
    this.mediaRecorder.start();
  }

  stopRecording() {
    this.isRecording = false;
    this.mediaRecorder.stop();
  }

  ngOnInit(): void {
    this.getJsonData();
  }

  goToExport() {
    this.router.navigate(['/export']);
  }

  openHelpModal() {
    this.dialog.open(HowItWorksDialogComponent,{ width: '100%',maxWidth:'1000px', data: { content: './assets/images/deployed_agent_diagram.png' }, });
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  getJsonData() {
    this.httpClient.get<any>('assets/bots-mapping.json').subscribe(
      (data) => {
        this.botsMappingData = data;
        console.log(this.botsMappingData);
        this.botsMappingData.forEach((item: { AGENT_INDUSTRY_TYPE: any; AGENT_ORCHESTRATION_FRAMEWORK: any; AGENT_FOUNDATION_MODEL: any; RUNTIME_ENV_SELECTION: any; }) => {
          const key = `${item.AGENT_INDUSTRY_TYPE}-${item.AGENT_ORCHESTRATION_FRAMEWORK}-${item.AGENT_FOUNDATION_MODEL}-${item.RUNTIME_ENV_SELECTION}`;
          this.botsMap.set(key, item);
        });

        let agentData = JSON.parse(localStorage.getItem('agentData') || '{}');
        this.selectedAgentData = {
          agentName: agentData[0].agentName ? agentData[0].agentName : '-',
          runTime: agentData[1].runTime ? agentData[1].runTime : '',
          frameWork: agentData[2].framework ? agentData[2].framework : '-',
          model: agentData[4].model ? agentData[4].model : '-',
          industry: agentData[3].industry ? agentData[3].industry : '-',
        }

        console.log(agentData);

        const runtime = this.selectedAgentData.runTime;
        const framework = this.selectedAgentData.frameWork;
        const model = this.selectedAgentData.model;
        const industry = this.selectedAgentData.industry;

        this.getBotUrl(industry, framework, model, runtime);
      },
      (error) => {
        console.error('Error reading JSON file:', error);
      }
    );
  }

  getBotUrl(industry: string, framework: string, model: string, runtime: string) {
    const key = `${industry}-${framework}-${model}-${runtime}`;
    const bot_config = this.botsMap.get(key);
    console.log(bot_config.CLOUD_RUN_URL);
    console.log(key);
    console.log(this.botsMap);
    this.botUrl = bot_config.CLOUD_RUN_URL + "/streamQuery";
  }

}
