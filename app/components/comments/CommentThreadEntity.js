import React from 'react'

const CommentThreadEntity = ({ children }) => <span style={style.span}>
  {children}
</span>

export default CommentThreadEntity

const style = {
  span: {
    background: "linear-gradient(#EBEAE4,#EBEAE4),linear-gradient(#EBEAE4,#EBEAE4),linear-gradient(rgba(115,81,212, 1),rgba(115,81,212, 1))",
    backgroundSize: ".05em 2px,.05em 2px,2px 2px",
    backgroundRepeat: "no-repeat,no-repeat,repeat-x",
    backgroundPosition: "0 93%,100% 93%,0 93%",
    textShadow: "0.03em 0 #EBEAE4, -0.03em 0 #EBEAE4, 0 0.03em #EBEAE4, 0 -0.03em #EBEAE4, 0.06em 0 #EBEAE4, -0.06em 0 #EBEAE4, 0.09em 0 #EBEAE4, -0.09em 0 #EBEAE4, 0.12em 0 #EBEAE4, -0.12em 0 #EBEAE4, 0.15em 0 #EBEAE4, -0.15em 0 #EBEAE4",
  },
}
