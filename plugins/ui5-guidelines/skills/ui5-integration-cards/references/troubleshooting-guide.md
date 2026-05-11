# Troubleshooting Guide

> Extracted from ui5-integration-cards skill  
> For main skill documentation, see [../SKILL.md](../SKILL.md)

## 8. Troubleshooting

### 8.1 "No Data to Display" Error

**Causes**:
1. Incorrect data path configuration
2. Content data path overriding primary path incorrectly
3. Network request failing
4. Data structure mismatch

**Solution checklist**:
- [ ] Verify `sap.card/data/path` is correct
- [ ] Check if `content/data/path` or `header/data/path` exists (may be wrong)
- [ ] Test data URL in browser/Postman
- [ ] Check browser network tab for failed requests
- [ ] Verify data structure matches item binding

### 8.2 Analytical Chart Not Rendering

**Causes**:
1. UID mismatch in feeds
2. Missing required measures/dimensions
3. Wrong data type for timeseries

**Solution**:
- [ ] Verify UIDs match chart type (see section 4.3)
- [ ] Check all required feeds are present
- [ ] For timeseries: ensure dimension has `"dataType": "date"`
- [ ] Verify measures/dimensions match feed values exactly

### 8.3 Configuration Editor Out of Sync

**Causes**:
1. Manifest changed without updating editor
2. Editor has fields not in manifest

**Solution**:
- [ ] Review manifest parameters
- [ ] Compare with `dt/Configuration.js` items
- [ ] Add missing fields to editor
- [ ] Remove obsolete fields from editor
- [ ] Verify `manifestpath` values are correct

---

