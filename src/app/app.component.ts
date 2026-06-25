import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuService } from './menu/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  protected readonly title = signal('Menú Manager');
  private readonly menuService = inject(MenuService);

  async ngOnInit(): Promise<void> {
    await this.menuService.load();

    console.log('dishes', this.menuService.dishes());
    console.log('sections', this.menuService.sections());
  }
}
