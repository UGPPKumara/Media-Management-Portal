# Service Level Agreement (SLA)
## Media Management Portal

---

| **Agreement Info** | |
|--------------------|-----------------|
| **Service Provider** | [Your Company Name] |
| **Client** | [Client Company Name] |
| **Effective Date** | [Start Date] |
| **Agreement Period** | 12 months |
| **Document Version** | 1.0 |

---

## 1. Introduction

This Service Level Agreement ("SLA") establishes the terms for support and maintenance services provided by [Your Company Name] ("Provider") to [Client Company Name] ("Client") for the Media Management Portal system.

---

## 2. Service Description

### 2.1 Covered Services

| Service | Included |
|---------|----------|
| System hosting and maintenance | ✅ |
| Bug fixes and security patches | ✅ |
| Technical support (as per plan) | ✅ |
| System monitoring | ✅ |
| Backup management | ✅ |
| Performance optimization | ✅ |

### 2.2 Excluded Services

| Service | Notes |
|---------|-------|
| Custom feature development | Available at additional cost |
| Third-party integrations | Quoted separately |
| Data migration | Project-based pricing |
| On-site support | Available at additional cost |

---

## 3. Service Availability

### 3.1 Uptime Guarantee

| Metric | Target |
|--------|--------|
| **Monthly Uptime** | 99.5% |
| **Annual Uptime** | 99.5% |
| **Maximum Downtime** | 3.6 hours/month |

### 3.2 Uptime Calculation

```
Uptime % = ((Total Minutes - Downtime Minutes) / Total Minutes) × 100
```

### 3.3 Excluded from Uptime Calculation

- Scheduled maintenance (with 48-hour notice)
- Force majeure events
- Client-caused outages
- Third-party service failures
- Network issues outside Provider's control

### 3.4 Scheduled Maintenance Windows

| Day | Time | Duration |
|-----|------|----------|
| Sunday | 02:00 - 06:00 (Local Time) | Up to 4 hours |

Emergency maintenance may be performed outside this window with notification.

---

## 4. Support Services

### 4.1 Support Plans

| Feature | Basic | Standard | Premium |
|---------|:-----:|:--------:|:-------:|
| Email Support | ✅ | ✅ | ✅ |
| Phone Support | ❌ | ✅ | ✅ |
| 24/7 Support | ❌ | ❌ | ✅ |
| Response Time (Critical) | 8 hours | 4 hours | 1 hour |
| Response Time (High) | 24 hours | 8 hours | 2 hours |
| Response Time (Medium) | 48 hours | 24 hours | 8 hours |
| Response Time (Low) | 5 days | 48 hours | 24 hours |
| Monthly Support Hours | 5 | 15 | Unlimited |
| Remote Sessions | ❌ | 2/month | Unlimited |

### 4.2 Support Hours

| Plan | Hours |
|------|-------|
| Basic | Mon-Fri, 9:00 AM - 5:00 PM |
| Standard | Mon-Fri, 8:00 AM - 8:00 PM |
| Premium | 24/7/365 |

### 4.3 Support Channels

| Channel | Email | Phone | Chat |
|---------|:-----:|:-----:|:----:|
| Basic | ✅ | ❌ | ❌ |
| Standard | ✅ | ✅ | ❌ |
| Premium | ✅ | ✅ | ✅ |

---

## 5. Incident Management

### 5.1 Severity Levels

| Severity | Description | Example |
|----------|-------------|---------|
| **Critical** | System completely down | Server crash, data loss |
| **High** | Major feature unavailable | Login failure, upload broken |
| **Medium** | Feature degraded | Slow performance, minor bugs |
| **Low** | Minor issue | UI glitches, cosmetic issues |

### 5.2 Response Times

| Severity | Initial Response | Target Resolution |
|----------|------------------|-------------------|
| Critical | Within SLA limit | 4 hours |
| High | Within SLA limit | 8 hours |
| Medium | Within SLA limit | 48 hours |
| Low | Within SLA limit | 5 business days |

### 5.3 Escalation Path

| Level | Contact | Timeframe |
|-------|---------|-----------|
| Level 1 | Support Team | 0-15 min |
| Level 2 | Senior Engineer | 15-60 min |
| Level 3 | Technical Lead | 1-2 hours |
| Level 4 | Management | 2+ hours |

---

## 6. Performance Standards

### 6.1 Response Time Targets

| Metric | Target |
|--------|--------|
| Page Load Time | < 3 seconds |
| API Response Time | < 500 ms |
| File Upload (50MB) | < 60 seconds |
| Search Response | < 1 second |

### 6.2 Capacity

| Metric | Capacity |
|--------|----------|
| Concurrent Users | 100+ |
| Storage | As contracted |
| Bandwidth | Unlimited |

---

## 7. Security & Backup

### 7.1 Security Measures

| Measure | Implementation |
|---------|----------------|
| Data Encryption | TLS 1.2+ in transit |
| Password Security | bcrypt hashing |
| Access Control | Role-based (RBAC) |
| Security Updates | Within 72 hours of release |

### 7.2 Backup Schedule

| Backup Type | Frequency | Retention |
|-------------|-----------|-----------|
| Full Database | Daily | 30 days |
| Incremental | Every 6 hours | 7 days |
| Media Files | Daily | 30 days |
| System Config | Weekly | 90 days |

### 7.3 Disaster Recovery

| Metric | Target |
|--------|--------|
| Recovery Time Objective (RTO) | 4 hours |
| Recovery Point Objective (RPO) | 6 hours |

---

## 8. Service Credits

### 8.1 Credit Calculation

If uptime falls below guaranteed levels:

| Monthly Uptime | Service Credit |
|----------------|----------------|
| 99.0% - 99.5% | 10% of monthly fee |
| 98.0% - 98.9% | 25% of monthly fee |
| 95.0% - 97.9% | 50% of monthly fee |
| Below 95.0% | 100% of monthly fee |

### 8.2 Credit Request Process

1. Client submits credit request within 30 days of incident
2. Provider verifies downtime data
3. Credit applied to next billing cycle
4. Credits do not exceed monthly fee

### 8.3 Credit Exclusions

Credits not applicable for:

- Scheduled maintenance
- Client-caused issues
- Force majeure
- Beta features
- Third-party failures

---

## 9. Client Responsibilities

The Client agrees to:

| Responsibility | Description |
|----------------|-------------|
| Provide Access | Grant necessary system access |
| Timely Communication | Report issues promptly |
| Contact Point | Designate primary contact |
| Environment | Maintain compatible browsers/devices |
| Data | Maintain own copy of critical data |
| Cooperation | Assist in troubleshooting |

---

## 10. Reporting & Reviews

### 10.1 Monthly Reports

Provider will deliver monthly reports including:

- Uptime statistics
- Support tickets summary
- Performance metrics
- Security incidents (if any)
- Recommendations

### 10.2 Quarterly Reviews

Quarterly meetings to discuss:

- Service performance
- SLA compliance
- Improvement opportunities
- Upcoming changes

---

## 11. Term & Termination

### 11.1 Agreement Term

- Initial term: 12 months
- Auto-renewal: Yes (cancel with 30 days notice)

### 11.2 Termination

| Party | Notice Required |
|-------|-----------------|
| Either party (convenience) | 30 days written notice |
| Material breach | 15 days to cure, then immediate |
| Non-payment | 15 days after due date |

### 11.3 Post-Termination

- Data export provided within 30 days
- Access revoked upon termination
- Outstanding invoices due immediately

---

## 12. Amendments

This SLA may be amended by:

- Mutual written agreement
- Provider with 30 days notice for non-material changes
- Client's continued use constitutes acceptance

---

## 13. Contact Information

### Provider Contacts

| Role | Name | Contact |
|------|------|---------|
| Support | Support Team | support@yourcompany.com |
| Account Manager | [Name] | am@yourcompany.com |
| Emergency | On-call Team | +XX XXX XXX XXXX |

### Client Contacts

| Role | Name | Contact |
|------|------|---------|
| Primary Contact | [Name] | [Email] |
| Technical Contact | [Name] | [Email] |
| Billing Contact | [Name] | [Email] |

---

## 14. Agreement Signatures

| | Provider | Client |
|---|----------|--------|
| **Signature** | _________________ | _________________ |
| **Name** | _________________ | _________________ |
| **Title** | _________________ | _________________ |
| **Date** | _________________ | _________________ |

---

**© 2026 [Your Company Name]. All Rights Reserved.**
