import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PredefinedBotComponent } from './components/predefined-bot/predefined-bot.component';
import { HomeComponent } from './components/home/home.component';
import { ConfigureBotComponent } from './components/configure-bot/configure-bot.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { ExportComponent } from './components/export/export.component';
import { AgentBotComponent } from './components/agent-bot/agent-bot.component';
import { ScriptComponent } from './components/script/script.component';


const routes: Routes = [  
  {path: '', component: HomeComponent},
  { path: 'create-bot', component: ConfigureBotComponent },
  { path: 'predefined-bot', component: PredefinedBotComponent },
  { path: 'spinner', component: SpinnerComponent },
  { path: 'export', component: ExportComponent },
  { path: 'script', component: ScriptComponent },
  { path: 'agent-bot', component: AgentBotComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
