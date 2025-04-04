import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss'
})
export class SkillsComponent implements OnInit {
  skillPositions : string[][] = [];

  skills = [
    "Angular",
    ".NET",
    "C#",
    "Spring Boot",
    "Java",
    "JSON",
    "XML",
    "SOLID",
    "Design Patterns",
    "SQL",
    "NoSQL",
    "Caching",
    "Rate Limiting",
    "CORS",
    "RESTful APIs",
    "SOAP APIs",
    "SoapUI",
    "Postman",
    "Swagger",
    "xUnit",
    "TestServer",
    "MVC",
    "DDD",
    "Clean Code",
    "SQL Server",
    "Azure",
    "Git",
    "Bitbucket",
    "GitHub",
    "JIRA",
    "Trello",
    "Agile",
    "Scrum",
    "Fast Learner",
    "Adaptability",
    "Communication",
    "Teamwork",
    "Problem Solving",
    "Time Management"
  ];

  currentlyDragging : number | undefined;
  mouseX : number | undefined;
  mouseY : number | undefined;


  ngOnInit() {
    for(let i = 0; i < this.skills.length; i++){
      let pos: string[] = [i * (90 / this.skills.length) + '%', ((i + 1) % 3) * 33 + '%', this.getRandomRotation()];
      this.skillPositions.push(pos);
    }
  }
  getRandomRotation(){
    let randomVal = (Math.random() * 30) - 15;
    return `rotate(${randomVal}deg)`;
  }
  startDragging(i : number){
    this.currentlyDragging = i;
  }
  mouseMove(e: MouseEvent){
    if(this.currentlyDragging == undefined){return;}

    this.skillPositions[this.currentlyDragging][0] = e.pageX - 70 + 'px';
    this.skillPositions[this.currentlyDragging][1] = e.pageY - 30 + 'px';

  }
  stopDragging(){
    this.currentlyDragging = undefined;
  }
}
