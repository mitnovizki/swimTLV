
/*Write a program that receives a four digit number as an input
 (negative or positive), and computes where adding a 5 to the number 
 would make it the greatest. For example : for the input 638, 
 the program would return 6538.*/

 
 //input: 638, number: 9
 function inreaseNumber(input, number)
 {
     let acc = 100
     let origin = input

     while(origin > 0 )         
     { 
         let single = Math.floor(origin / acc) /* 6  |  3  |  8 */ 

         if(single < number)
         {
            //console.log(single, number, input * acc, acc)

            let result = (input - origin) * acc   //638 - 38 * 10 == 6000
            //console.log( result)//6000

            result += number * acc * 10 + origin //6000 + 5 *10 *10 + 38 
            //console.log( result)

            return result
         }
         else{
            origin = origin % acc   //38  //8
            acc = acc/10            //10  //1 
         }
     }
     return input * 10 + number
 }

 console.log(inreaseNumber(638, 5))

 console.log(inreaseNumber(638, 9))
 console.log(inreaseNumber(638, 1))

 /*
  * original: 638   | 38 | 8
  * acc:      100   | 10 | 1
  * single    6     | 3  | 8
  * 
    compare:
            origin /= acc (6)
            origin < num? replace: continue
    replace:
            number * acc * 10 + origin
    continue:
            original = original % acc
            acc /= 10
   */