import { NgModule } from '@angular/core';
import {
  MatMenuModule,
  MatInputModule,
  MatCardModule,
  MatButtonModule,
  MatToolbarModule,
  MatExpansionModule,
  MatProgressSpinnerModule,
  MatPaginatorModule,
  MatDialogModule,
  MatOptionModule,
} from '@angular/material';

@NgModule({
  exports: [
    MatMenuModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatDialogModule,
    MatOptionModule
  ]
})
export class AngularMaterialModule {}