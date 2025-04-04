import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SkillsComponent } from "./skills/skills.component";
import { HeaderComponent } from "./header/header.component";
import { ProjectsComponent } from './projects/projects.component';
import { ExperinceComponent } from './experince/experince.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SkillsComponent, HeaderComponent, ProjectsComponent, ExperinceComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'portfolio';
}
