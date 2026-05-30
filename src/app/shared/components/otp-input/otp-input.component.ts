import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  QueryList,
  ViewChildren,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-otp-input',
  standalone: true,
  templateUrl: './otp-input.component.html',
})
export class OtpInputComponent {
  @Output() otpComplete = new EventEmitter<string>();
  @ViewChildren('otpBox') otpBoxes!: QueryList<ElementRef<HTMLInputElement>>;

  digits = signal<string[]>(Array(6).fill(''));

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);

    const updated = [...this.digits()];
    updated[index] = val;
    this.digits.set(updated);

    // Move forward
    if (val && index < 5) {
      this.otpBoxes.toArray()[index + 1]?.nativeElement.focus();
    }
    // Emit when all filled
    if (updated.every((d) => d !== '')) {
      this.otpComplete.emit(updated.join(''));
    }
  }

  onKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.digits()[index] && index > 0) {
      this.otpBoxes.toArray()[index - 1]?.nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
    const updated = Array(6).fill('');
    pasted.split('').forEach((ch, i) => (updated[i] = ch));
    this.digits.set(updated);
    const nextEmpty = updated.findIndex((d) => d === '');
    const focusIdx = nextEmpty === -1 ? 5 : nextEmpty;
    this.otpBoxes.toArray()[focusIdx]?.nativeElement.focus();
    if (updated.every((d) => d !== '')) {
      this.otpComplete.emit(updated.join(''));
    }
  }

  reset() {
    this.digits.set(Array(6).fill(''));
    this.otpBoxes?.toArray()[0]?.nativeElement.focus();
  }

  getValue(): string {
    return this.digits().join('');
  }
}
