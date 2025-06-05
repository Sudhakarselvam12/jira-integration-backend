import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Pagination, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';

const StyledTableCell = styled(TableCell)({
  fontWeight: 'bold'
});

const StyledErrorContainer = styled('div')({
  color: 'red',
  textAlign: 'center'
});

const IssuesList = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuesFound, setIssuesFound] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await axios.get(`/jira-issues`, {
          params: {
            startAt: (page*rowsPerPage)-rowsPerPage,
            maxResults: rowsPerPage,
          },
        });
        
        const data = response.data.issues;

        if (!response.data || response.data.total === 0) {
          setIssuesFound(false);
          throw new Error('No issues found!');
        }
        setIssues(data);
        setTotalCount(response.data.total);
        setTotalPages(parseInt((response.data.total/rowsPerPage)+1));

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchIssues();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
    setTotalPages(parseInt((totalCount/event.target.value)+1));
  };

  if (loading) {
    return (<div>
        Loading...
    </div>
    );
  }

  if (!issuesFound) {
    return (<div>
        No issues found!
    </div>
    );
  }

  if (error) {
    return <StyledErrorContainer>Error: {error}</StyledErrorContainer>;
  }

  return (
    <>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Issue Key</StyledTableCell>
              <StyledTableCell>Summary</StyledTableCell>
              <StyledTableCell>Issue Type</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Assignee </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issues.map(issue => (
              <TableRow>
                <TableCell>{issue.key}</TableCell>
                <TableCell>{issue.fields.summary}</TableCell>
                <TableCell>{issue.fields.issuetype.name}</TableCell>
                <TableCell>{issue.fields.status.name}</TableCell>
                <TableCell>{issue.fields.assignee?.displayName || ""}</TableCell>  
              </TableRow>
            ))}
          </TableBody>
        </Table>
      <div style = {{marginTop: '10px', marginBottom: '10px', display: 'flex',  alignment: 'center', justifyContent: 'space-between'}}>
        <Pagination
        count={totalPages}
        page={page}
        onChange={handleChangePage}
        style={{marginLeft: '10px'}}
        >
        </Pagination>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Select
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
            style={{ marginRight: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '70px', height: '32px' }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={40}>40</MenuItem>
          </Select>
          <span style={{marginRight: '10px'}}>Items per page</span>
        </div>
      </div>
    </>
  );
};

export default IssuesList;
