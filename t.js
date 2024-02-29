import vine, { VineString } from "@vinejs/vine"


VineString.macro('slug', function(opt) {
  console.log(this.use.toString())
  return this
})

const v = vine.compile(
  vine.object({
    q: vine.string().slug(),
  })
)

v.validate({
  q: 'jfjf'
  
  
})