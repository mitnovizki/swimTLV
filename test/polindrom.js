
// function chcekIfPolindrom(str)
// {
//     for(let i= 0; i<str.length/2; i++) //abba
//     {

const { ReplSet } = require("mongodb");

//         let first = str.charAt(i)
//         let last  = str.charAt(str.length-i)
//         if(first!=last)
//         {
//             return false
//         }
//     }
//     return true
// }



function checkIfploindrom(str)              //abba | i=0 | j=3
{
 let i=0;
 let j=length-1;
 let result = function check (str, i, j)
 {
     if(i<j)
     {
         if(str[i] != str[j])
         {
             return false
         }
         else{
             i=i+1;
             j=j-1
             return check(i,j)
         }
     }
     return true
 }
 return result

}
