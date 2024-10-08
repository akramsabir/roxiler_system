const TextBox = (props) => {
    return (
        <div>
            <label htmlFor={`${props.id}`} className="form-label">{props.label}</label>
            <input className="form-control" value={props.value} type={props.type} id={props.id} name={props.name} placeholder={props.hint} onChange={props.change} />
        </div>
    );
}

const TextArea = (props) => {

    return (
        <div>
            <label htmlFor="basiInput" className="form-label">{props.label}</label>
            <textarea className="form-control" value={props.value} type={props.type} id={props.id} name={props.name} placeholder={props.hint} onChange={props.change} />
        </div>
    );
}
const SubmitBtn = (props) => {
    return (
        props.status === true ? <button type="button" class={`btn btn-${props.type} btn-load`}><span class="d-flex align-items-center"><span class="flex-grow-1 me-2">Please wait...</span><span class="spinner-grow flex-shrink-0" role="status"><span class="visually-hidden">Please wait...</span></span></span></button>
            : <button type="submit" className={`btn btn-${props.type} btn-label waves-effect right waves-light float-right`}><i className={`${props.icon} label-icon align-middle fs-16 ms-2`} /> {props.text}</button>
    );
}
const IsRequired = () => {
    return (
        <span style={{ color: 'blue', marginLeft: 5, borderRadius: '50%', background: 'rgb(240, 248, 255)', textAlign: 'center', width: 20, height: 20, padding: '0px 5px' }}>*</span>
    );
}
export { TextBox, TextArea, SubmitBtn, IsRequired };