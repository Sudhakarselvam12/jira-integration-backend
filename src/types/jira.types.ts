/* eslint-disable @typescript-eslint/no-explicit-any */
export interface JiraProject {
  id: string;
  jiraId: number;
  key: string;
  name: string;
  [key: string]: any;
}

export interface JiraIssue {
  id: string;
  key: string;
  [key: string]: any;
}
