import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ComponentFixture } from "@angular/core/testing";
import { signal } from "@angular/core";
import { AppComponent } from "./app.component";

describe("AppComponent", () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it("should create the app", () => {
    expect(component).toBeTruthy();
  });

  it(`should have initial title signal with value 'dinnr-app'`, () => {
    // Test signal value directly
    expect(component.title()).toBe("dinnr-app");
  });

  it("should update current year signal", () => {
    const currentYear = new Date().getFullYear();
    expect(component.currentYear()).toBe(currentYear);
  });

  it("should have computed footer text signal", () => {
    const currentYear = new Date().getFullYear();
    expect(component.footerText()).toBe(`© ${currentYear} DINNR. Powered by PUBG API.`);
  });

  it("should have navigation items signal with correct structure", () => {
    const navItems = component.navItems();
    expect(navItems).toHaveLength(3);
    expect(navItems[0].path).toBe("/home");
    expect(navItems[0].label).toBe("Home");
  });

  it("should have features signal with expected items", () => {
    const features = component.features();
    expect(features).toContain("Match Analysis");
    expect(features).toContain("Player Statistics");
  });

  it("should render DINNR title", () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector("h1")?.textContent).toContain("DINNR");
  });

  it("should react to signal changes", () => {
    // Test signal reactivity
    const originalTitle = component.title();
    component.title.set("updated-title");
    expect(component.title()).toBe("updated-title");
    expect(component.title()).not.toBe(originalTitle);
  });

  it("should render navigation links from signals", () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const navLinks = compiled.querySelectorAll("nav a");
    expect(navLinks.length).toBeGreaterThan(0);

    // Check that first nav link contains "Home"
    const homeLink = Array.from(navLinks).find(link =>
      link.textContent?.includes("Home")
    );
    expect(homeLink).toBeTruthy();
  });
});
