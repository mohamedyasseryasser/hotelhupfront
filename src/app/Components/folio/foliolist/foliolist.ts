 import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  imports: [
    CommonModule,
    FormsModule
  ],  selector: 'app-foliolist',
  styleUrl: './foliolist.css',
  templateUrl: './foliolist.html',
})
export class Foliolist implements OnInit {

 readonly folioId  = input<number | null>(null);
  readonly  error = signal('');
  
  
  private router = inject(Router);
  readonly propertyId= input<number | null>(null);  
  ngOnInit() {
    if(Number(this.folioId()) <= 0 || !Number.isInteger(Number(this.folioId()))){
          this.error.set("folioid is invalid");
          return;
    }
     if(Number(this.propertyId())<=0 || !this.propertyId())
{
 this.error.set("proertyid in invalid");
 return ;
   }
  }
  
 open() {
  console.log('folioId', this.folioId());

  if (this.folioId() && this.folioId()! > 0) {
    this.router.navigate(
      ['/folios', this.folioId()],
      {
        queryParams: {
          propertyId: this.propertyId()
        }
      }
    );
  }
}
}