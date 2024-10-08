const TableRows = (props) => {
  return (
    Array.from({ length: props.rows }, (_, i) => (
      <tr key={i} className="shimmer">
        <td colSpan={props.colspan} ><span style={{ visibility: 'hidden' }}>test</span></td>
      </tr>
    ))
  );

}

const NoRecords = (props) => {
  return (

    <div className="noresult" style={{ display: 'block', width: '100%' }}>
      <div className="text-center">
        <lord-icon src="https://cdn.lordicon.com/msoeawqm.json" trigger="loop" colors="primary:#121331,secondary:#08a88a" style={{ width: '75px', height: '75px' }} />
        <h5 className="mt-2">Sorry! No Result Found</h5>
      </div>
    </div>
  );
}

const ContentLoader = (props) => {
  return (

    <div className="d-flex justify-content-center align-items-center" style={{ height: "70vh" }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
export { TableRows, NoRecords, ContentLoader };