import { Component, inject, OnInit, signal } from '@angular/core';
import { Userservice } from '../../../Service/userservice';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserRecord } from '../../../Models/user';
import { finalize } from 'rxjs';
import { Permissionservice } from '../../../Service/permissionservice';
import { userErrorMessage } from '../../../errors/usererror';
import { DatePipe } from '@angular/common';

@Component({
  imports: [RouterLink,DatePipe],
  selector: 'app-userdetails',
  styleUrl: './userdetails.css',
  templateUrl: './userdetails.html',
})
export class Userdetails implements OnInit {
  private readonly api = inject(Userservice);
  private readonly route = inject(ActivatedRoute);

  readonly permissions = inject(Permissionservice);

  readonly user = signal<UserRecord | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
 readonly propertyId = signal<number | null>(null);
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
this.route.queryParamMap.subscribe(params => {
  const propertyId = Number(params.get('propertyId'));

 if(!propertyId){
       this.error.set('العقار الخاص بالمستخدم غير موجود.');
      this.loading.set(false);
      return;
    } 
     this.propertyId.set(propertyId);

  });   
    if (!id) {
      this.error.set('معرف المستخدم غير موجود.');
      this.loading.set(false);
      return;
    }

    this.api
      .getUserById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (r) =>
          r.success && r.data
            ? this.user.set(r.data)
            : this.error.set(r.message),

        error: (e) =>
          this.error.set(
            userErrorMessage(e, 'تعذر تحميل بيانات المستخدم.'),
          ),
      });
  }
} {
  
}
