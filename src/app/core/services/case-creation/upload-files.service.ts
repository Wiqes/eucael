import { inject, Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class UploadFilesService {
  private formBuilder = inject(FormBuilder);

  form = this.formBuilder.group({
    fileIds: this.formBuilder.array([this.formBuilder.control('', Validators.required)]),
  });
}
