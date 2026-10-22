const key: string = "0123pqrsSTUt456cdenouVWXvjklmwCDEFxOPQRYZabyIJKzfghiLMNGH789AB";

function encode(num: number): string{
    if(num==0) return "";
    let ans: string="";

    while(num>0){
        let rem: number=num%62;
        ans= ans+ key.charAt(rem);
        num = Math.trunc(num/62);
    }
    return ans;
}

function decode(num: string): number{
    let ans: number=0;
    for(let i:number =0;i<num.length;i++){
        const index = key.indexOf(num.charAt(i)) || -1;
        if(index==-1) return -1;
        ans += index * Math.pow(62,i);
    }
    return ans;
}

export {
    encode,
    decode 
}