import bcrypt from "bcryptjs"

export const SALTPASS = bcrypt.genSaltSync(10);


export const JWTSALT = 'cyBKB2+Drlu61dgVdLLtoQ=='