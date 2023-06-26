import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-hozirontal-split-layout',
  templateUrl: './hozirontal-split-layout.component.html',
  styleUrls: ['./hozirontal-split-layout.component.scss']
})
export class HozirontalSplitLayoutComponent implements OnInit {
  @Input() proportion: string = '30'
  @Input() usePixelForProportions: boolean = false
  @Input() hideDivider: boolean = false

  constructor() { }

  ngOnInit(): void {
  }

  get customStyles(): string {
    let css = ''

    // if (this.usePixelForProportions) {
    //   css += `layout-proportionPixelMax-of-${this.proportion} `
    // } else {
    //   css += `layout-proportion-of-${this.proportion} `
    // }

    if (this.usePixelForProportions) {
      css += `grid-template-rows: calc(0% + ${this.proportion}px) 1% calc(99% - ${this.proportion}px);`
    } else {
      css += `grid-template-rows: calc(0% + ${this.proportion}%) 1% calc(99% - ${this.proportion}%);`
    }

    return css;
  }

}
