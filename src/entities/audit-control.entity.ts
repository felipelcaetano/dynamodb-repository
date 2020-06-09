import { DateService } from '../services/date.service'

export enum EUserType {
  CUC = 'cuc',
  EMAIL = 'email',
  SYSTEM = 'system',
}

export enum EActionType {
  CREATE = 'create',
  MODIFY = 'modify',
  QUERY = 'query',
}

export class AuditControlEntity {
  constructor(
    entityActionType: EActionType,
    userType?: EUserType,
    userId?: string,
  ) {
    if (entityActionType === EActionType.CREATE) {
      const now = DateService.nowString()
      this.createdAt = now
      this.createdBy = this.formatAudituUser(userType, userId)
    }

    if (entityActionType === EActionType.MODIFY) {
      const now = DateService.nowString()
      this.updatedAt = now
      this.updatedBy = this.formatAudituUser(userType, userId)
    }
  }

  private createdAt?: string
  private updatedAt?: string
  private createdBy?: string
  private updatedBy?: string

  private formatAudituUser(
    userType: EUserType = EUserType.SYSTEM,
    userId: string = process.env.APPNAME || 'RV-CUSTOMER',
  ): string {
    return `${userType}:${userId}`
  }

  getCreatedAt(): string {
    return this.createdAt
  }

  getUpdatedAt(): string {
    return this.updatedAt
  }

  getCreatedBy(): string {
    return this.createdBy
  }

  getUpdatedBy(): string {
    return this.updatedBy
  }

  public setCreatedBy(userType: EUserType, userId: string): void {
    this.createdBy = this.formatAudituUser(userType, userId)

    this.setUpdatedBy(userType, userId)
  }

  public setUpdatedBy(userType: EUserType, userId: string): void {
    this.updatedBy = this.formatAudituUser(userType, userId)
  }

  public setCreatedAt() {
    const now = DateService.nowString()
    this.createdAt = now
    this.updatedAt = now
  }

  public setUpdatedAt() {
    const now = DateService.nowString()
    this.updatedAt = now
  }
}
