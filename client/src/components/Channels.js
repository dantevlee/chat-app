const Channels = () =>{
  <React.Fragment>
  <div className="col-md-3 pr-0">
    <div className="card card-bordered">
      <div className="card-header">
        <h4 className="card-title">
          <strong>Online</strong>
        </h4>
      </div>
      <div
        className="ps-container ps-theme-default ps-active-y"
        id="chat-content"
        style={{
          overflow: "scroll !important",
          width: "300px", 
          height: "1000px", 
        }}
      >
        <div>
          {/* <div className="users">{userName}</div> */}
        </div>
      </div>
    </div>
  </div>
</React.Fragment>
}

export default Channels