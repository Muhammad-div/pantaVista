# PantaVista API Templates - Quick Reference

## File Organization Summary

The large `getappinit.xml` (11,794 lines) has been organized into the following structured templates:

```
templates/
├── README.md                              # Detailed documentation
├── index.md                              # This quick reference
├── common_envelope_template.xml          # Base envelope structure
├── get_app_init_response.xml            # Main API response template
├── interaction_entities_metadata.xml    # Interaction field definitions
├── configuration_entities_metadata.xml  # Config field definitions
├── ui_entities_metadata.xml            # UI component field definitions
└── system_messages.xml                 # Success/error messages
```

## Quick Start

### For API Development:
1. **Base Structure**: Use `common_envelope_template.xml`
2. **Main Response**: Use `get_app_init_response.xml`
3. **Field Definitions**: Include relevant metadata files
4. **Messages**: Use `system_messages.xml` for responses

### For Frontend Development:
1. **Data Structure**: Check `*_entities_metadata.xml` files for field definitions
2. **Error Handling**: Reference `system_messages.xml` for error codes
3. **API Response**: Use `get_app_init_response.xml` to understand response format

## Entity Categories

| Category | File | Purpose |
|----------|------|---------|
| **Core** | `common_envelope_template.xml` | Base XML envelope structure |
| **Response** | `get_app_init_response.xml` | Complete GET_APP_INIT response |
| **Interaction** | `interaction_entities_metadata.xml` | Interaction management |
| **Configuration** | `configuration_entities_metadata.xml` | System settings |
| **UI Components** | `ui_entities_metadata.xml` | User interface elements |
| **Messages** | `system_messages.xml` | Success/error responses |

## Key Benefits

✅ **Maintainable**: Separated concerns into logical files  
✅ **Reusable**: Common templates can be shared across APIs  
✅ **Documented**: Each file has clear purpose and usage  
✅ **Modular**: Include only what you need  
✅ **Validated**: Maintains original XML structure and validity  

## Original File Mapping

| Original Lines | New Template File | Content |
|---------------|------------------|---------|
| 1-11 | `common_envelope_template.xml` | XML header + envelope |
| 12-967 | `*_entities_metadata.xml` | Field definitions |
| 968-11770 | `get_app_init_response.xml` | Data structure |
| 11771-11794 | `system_messages.xml` | System messages |

For detailed information, see `README.md`.
