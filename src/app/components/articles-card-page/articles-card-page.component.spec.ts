import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticlesCardPageComponent } from './articles-card-page.component';

describe('ArticlesCardPageComponent', () => {
  let component: ArticlesCardPageComponent;
  let fixture: ComponentFixture<ArticlesCardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticlesCardPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticlesCardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
