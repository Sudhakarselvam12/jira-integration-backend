import { issueService } from "../../src/services/issue.service";

describe('Unit Tests - Issue Service', () => {
  it('should return 0 when empty', async () => {
    const count = await issueService.getIssuesCount();
    expect(count).toBe(0);
  });
});