# Code Review Checklist

---

## 🎯 Code Review Checklist

When reviewing code (or before committing), verify:

### Architecture
- [ ] Follows Atomic Design pattern correctly
- [ ] Component is in the right directory
- [ ] No circular dependencies
- [ ] Services used for data access

### TypeScript
- [ ] No `any` types
- [ ] All props/functions typed
- [ ] Zod schemas for validation
- [ ] Return types specified

### Styling
- [ ] Uses CSS Modules
- [ ] References design tokens
- [ ] No hardcoded values
- [ ] Responsive design considered

### State Management
- [ ] Zustand for global state
- [ ] Local state for UI-only
- [ ] Immutable updates
- [ ] Loading/error states handled

### Testing
- [ ] Unit tests for business logic
- [ ] E2E tests for critical flows
- [ ] Edge cases covered
- [ ] Mocks used appropriately

### Performance
- [ ] No unnecessary re-renders
- [ ] Debounced search inputs
- [ ] Virtualized long lists
- [ ] Images optimized

### Accessibility
- [ ] Semantic HTML used
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Color contrast sufficient

### Security
- [ ] Input validation with Zod
- [ ] No SQL injection risks
- [ ] No sensitive data logged
- [ ] Error messages don't leak info

---

**Last Updated:** 2026-02-04
