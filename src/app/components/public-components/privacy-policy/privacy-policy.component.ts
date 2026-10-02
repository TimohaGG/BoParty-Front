import {Component} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {RouterLink} from "@angular/router";
import {MatAnchor} from "@angular/material/button";

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [
    MatIcon,
    RouterLink,
    MatAnchor
  ],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css'
})
export class PrivacyPolicyComponent {
  readonly updatedAt = '02.10.2026';
}
