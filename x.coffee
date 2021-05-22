count = 0
fib3= (a=1.5,b=1,c=1)->
  count++
  if count >20
    return
  next = a*b+c

  console.log next,next/c
  if -100 > next > 100
    return
  fib3 a,c,next
  return

fib3()

