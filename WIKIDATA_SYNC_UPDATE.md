# Wikidata Sync Service Update

## Overview

This update transforms the Gala Wikidata integration from OAuth2 to bot authentication and ensures proper sync of case studies to Wikidata with the structure matching the provided examples.

## Key Changes

### 1. Authentication System Overhaul

**Before**: OAuth2 client credentials flow
**After**: Bot login authentication with hardcoded credentials

- **Bot Username**: `GalaSyncService`
- **Bot Password**: `uh4f9i23ip9nojj15vt9obm8lsn7c3lo`
- Removed OAuth2 dependencies and environment variable requirements
- Implemented session-based authentication with cookie management
- Added Redis-backed session persistence with 1-hour expiration

### 2. Property Mapping Updates

Updated the Wikidata property mapping to match the structure from the provided examples:

- **P31**: Instance of: case study (Q155207)
- **P1476**: Title
- **P2093**: Author name strings (multiple authors supported)
- **P407**: Language of work or name
- **P953**: Full work available at URL (using learngala.com domain)
- **P1433**: Published in: Gala (Q130549584)
- **P577**: Publication date (when available)
- **P5017**: Last update (when available)
- **P6216**: Copyright status: copyrighted (Q50423863)
- **P275**: Copyright license (defaults to CC BY 4.0 - Q20007257)

### 3. Service Architecture

**Updated Files**:
- `app/services/wikidata.rb` - Main module with bot authentication
- `app/services/wikidata/sync_service.rb` - Core sync logic
- `app/jobs/wikidata_case_sync_job.rb` - Job for syncing cases
- `app/jobs/wikidata_link_sync_job.rb` - Job for syncing existing links

**Key Features**:
- Automatic entity creation for new cases
- Entity updating for existing cases
- Property mapping based on case attributes
- WikidataLink association management
- Error handling and logging
- Redis-based session management

### 4. Case Model Integration

The Case model already includes the proper associations and callbacks:

```ruby
has_many :wikidata_links, -> { order(position: :asc) },
         as: :record, dependent: :destroy, inverse_of: :record

after_save :sync_to_wikidata, if: -> {
  published? && (saved_change_to_published_at? ||
                saved_change_to_title? ||
                saved_change_to_authors? ||
                saved_change_to_locale?)
}
```

### 5. Sync Triggers

The sync is automatically triggered when:
- A case is published for the first time
- Published case title, authors, or locale changes
- Manual sync via job

## Usage

### Automatic Sync
Cases are automatically synced to Wikidata when they meet the trigger conditions above.

### Manual Sync
```ruby
# Sync a specific case
qid = Wikidata::SyncService.sync!(case, 'en')

# Or trigger via job
WikidataCaseSyncJob.perform_later(case.id)
```

### Testing
Run the test script to verify functionality:
```ruby
# In Rails console
load 'scripts/test_wikidata_sync.rb'
```

## Example Output

For a case titled "Digital Healthcare Innovation", the sync would create a Wikidata entity with:

- **Label**: "Digital Healthcare Innovation"
- **Description**: "Case study on [case.dek content]"
- **Instance of**: case study
- **Author**: [extracted from case.authors array]
- **Language**: English (or case.locale)
- **URL**: https://www.learngala.com/cases/digital-healthcare-innovation
- **Published in**: Gala
- **License**: Creative Commons Attribution 4.0 International

## Security Note

The bot credentials are hardcoded for this POC as requested. In production, these should be moved to environment variables or a secure credential store.

## Dependencies

- Redis (for session storage)
- Active job backend (for background sync jobs)
- Wikidata bot account with edit permissions

## Troubleshooting

1. **Authentication Issues**: Check bot credentials and ensure the account has proper permissions
2. **Session Expiry**: Sessions auto-refresh when expired
3. **Property Conflicts**: The system handles existing properties by adding new claims
4. **Network Issues**: Jobs will retry automatically on failure

## Future Enhancements

- Implement proper claim updating (vs. adding duplicate claims)
- Add support for removing outdated claims
- Implement main subject (P921) detection using NLP
- Add bulk sync capabilities for existing cases
- Implement more sophisticated error handling and recovery 