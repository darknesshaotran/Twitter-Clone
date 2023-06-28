const fullname = 'darkness'
console.log(fullname)
type Handle = () => Promise<string>
const handle: Handle = () => Promise.resolve(fullname)
handle().then((res) => console.log(res))
