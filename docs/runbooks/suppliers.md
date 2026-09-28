# Suppliers Runbook

## Scope
Supplier create/update contract cleanup:
- Removed legacy form fields: API endpoint, API key, Currency (MDL input)
- Added tax id field: codFiscal
- Kept compatibility for legacy payload keys on API input (ignored + warning logged)

## Current Supplier Contract
Accepted payload fields:
- name (required)
- email (optional)
- phones (required, 1-5)
- address (optional)
- website (optional)
- codFiscal (optional)
- preferred_channel (optional: email|phone|chat|web)
- notes (optional)
- defaultLeadTimeDays (optional)

Ignored legacy fields:
- apiEndpoint
- apiKey
- defaultCurrency

## Validation And Normalization
Phones:
- Input allows local formats and is normalized to +373XXXXXXXX
- Validation is strict MD E.164 style via +373 + 8 digits

codFiscal:
- Normalization: trim + remove spaces and dashes
- Validation rule: ^\\d{8,13}$
- Invalid codFiscal returns HTTP 400 with error: Cod fiscal invalid

Website:
- Adds https:// prefix when missing
- Accepts only http/https URL

## UI Behavior
Supplier form now:
- Does not render API endpoint/API key/Currency fields
- Notes section is moved to the end of the form
- Includes Cod fiscal input

## Database
Prisma model Supplier includes:
- codFiscal String?

Migration:
- prisma/migrations/20260915103000_supplier_contact_fields_overhaul/migration.sql
- Adds codFiscal and other contact fields
- Creates optional supplier_secrets_backup before dropping apiEndpoint/apiKey

## API Logging (temporary)
Routes log warning when legacy fields are received:
- Legacy supplier fields ignored
Recommended retention: 24-72h, then remove warning block if no legacy clients remain.

## Verification Checklist
- POST create supplier with valid codFiscal persists successfully
- POST with apiEndpoint/apiKey/defaultCurrency does not persist those fields
- UI does not show API endpoint/API key/Currency inputs
- Notes appears at the end of the form
- Phones enforce 1-5 and MD normalization
- Invalid codFiscal returns 400

## Rollback
If rollback is required:
1. Revert supplier UI/API commits.
2. Add reverse migration to recreate apiEndpoint/apiKey columns if needed.
3. Restore values from supplier_secrets_backup.
