import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Isp } from './isp.entity';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
}

@Entity('isp_branding')
export class IspBranding {
  @ApiProperty({
    description: 'Unique identifier for ISP branding',
    example: 'uuid-here'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Company/ISP name',
    example: 'MyISP Networks'
  })
  @Column({ type: 'varchar', length: 255 })
  companyName: string;

  @ApiProperty({
    description: 'Company logo URL',
    required: false
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl?: string;

  @ApiProperty({
    description: 'Company favicon URL',
    required: false
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  faviconUrl?: string;

  @ApiProperty({
    description: 'Primary brand color',
    example: '#007bff'
  })
  @Column({ type: 'varchar', length: 7, default: '#007bff' })
  primaryColor: string;

  @ApiProperty({
    description: 'Secondary brand color',
    example: '#6c757d'
  })
  @Column({ type: 'varchar', length: 7, default: '#6c757d' })
  secondaryColor: string;

  @ApiProperty({
    description: 'Accent color',
    example: '#28a745'
  })
  @Column({ type: 'varchar', length: 7, default: '#28a745' })
  accentColor: string;

  @ApiProperty({
    description: 'Background color',
    example: '#ffffff'
  })
  @Column({ type: 'varchar', length: 7, default: '#ffffff' })
  backgroundColor: string;

  @ApiProperty({
    description: 'Text color',
    example: '#212529'
  })
  @Column({ type: 'varchar', length: 7, default: '#212529' })
  textColor: string;

  @ApiProperty({
    description: 'Theme colors as JSON',
    required: false
  })
  @Column({ type: 'json', nullable: true })
  themeColors?: ThemeColors;

  @ApiProperty({
    description: 'Custom CSS styles',
    required: false
  })
  @Column({ type: 'text', nullable: true })
  customCss?: string;

  @ApiProperty({
    description: 'Footer text',
    required: false
  })
  @Column({ type: 'text', nullable: true })
  footerText?: string;

  @ApiProperty({
    description: 'Contact email',
    required: false
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  contactEmail?: string;

  @ApiProperty({
    description: 'Contact phone',
    required: false
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  contactPhone?: string;

  @ApiProperty({
    description: 'Contact address',
    required: false
  })
  @Column({ type: 'text', nullable: true })
  contactAddress?: string;

  @ApiProperty({
    description: 'Social media links',
    required: false
  })
  @Column({ type: 'json', nullable: true })
  socialLinks?: SocialLinks;

  @ApiProperty({
    description: 'Welcome message for portal',
    required: false
  })
  @Column({ type: 'text', nullable: true })
  welcomeMessage?: string;

  @ApiProperty({
    description: 'Terms of service content',
    required: false
  })
  @Column({ type: 'text', nullable: true })
  termsOfService?: string;

  @ApiProperty({
    description: 'Privacy policy content',
    required: false
  })
  @Column({ type: 'text', nullable: true })
  privacyPolicy?: string;

  @ApiProperty({
    description: 'Support instructions',
    required: false
  })
  @Column({ type: 'text', nullable: true })
  supportInstructions?: string;

  @ApiProperty({
    description: 'Custom login page background image URL',
    required: false
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  loginBackgroundUrl?: string;

  @ApiProperty({
    description: 'Enable dark mode theme',
    example: false
  })
  @Column({ type: 'boolean', default: false })
  enableDarkMode: boolean;

  @ApiProperty({
    description: 'Show company logo on login page',
    example: true
  })
  @Column({ type: 'boolean', default: true })
  showLogoOnLogin: boolean;

  @ApiProperty({
    description: 'Associated ISP'
  })
  @OneToOne(() => Isp, (isp) => isp.branding)
  @JoinColumn()
  isp: Isp;

  @ApiProperty({
    description: 'Creation timestamp'
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp'
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  getThemeColors(): ThemeColors {
    return this.themeColors || {
      primary: this.primaryColor,
      secondary: this.secondaryColor,
      accent: this.accentColor,
      background: this.backgroundColor,
      surface: '#ffffff',
      text: this.textColor,
      textSecondary: '#6c757d'
    };
  }

  hasCustomStyling(): boolean {
    return !!(this.customCss || this.themeColors || this.loginBackgroundUrl);
  }

  isContactInfoComplete(): boolean {
    return !!(this.contactEmail && this.contactPhone && this.contactAddress);
  }

  generatePortalConfig() {
    return {
      branding: {
        companyName: this.companyName,
        logoUrl: this.logoUrl,
        faviconUrl: this.faviconUrl,
        colors: this.getThemeColors(),
        welcomeMessage: this.welcomeMessage,
        footerText: this.footerText,
        socialLinks: this.socialLinks,
        enableDarkMode: this.enableDarkMode,
        showLogoOnLogin: this.showLogoOnLogin,
        loginBackgroundUrl: this.loginBackgroundUrl
      },
      contact: {
        email: this.contactEmail,
        phone: this.contactPhone,
        address: this.contactAddress
      },
      legal: {
        termsOfService: this.termsOfService,
        privacyPolicy: this.privacyPolicy
      },
      support: {
        instructions: this.supportInstructions
      }
    };
  }
}