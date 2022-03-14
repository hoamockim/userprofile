export default class StringUtil {
    static stripAcents(input:string): string {
        const source: string[] = [
        "À", "Á", "Â", "Ã", "È", "É",
        "Ê", "Ì", "Í", "Ò", "Ó", "Ô", "Õ", "Ù", "Ú", "Ý", "à", "á", "â",
        "ã", "è", "é", "ê", "ì", "í", "ò", "ó", "ô", "õ", "ù", "ú", "ý",
        "Ă", "ă", "Đ", "đ", "Ĩ", "ĩ", "Ũ", "ũ", "Ơ", "ơ", "Ư", "ư", "Ạ",
        "ạ", "Ả", "ả", "Ấ", "ấ", "Ầ", "ầ", "Ẩ", "ẩ", "Ẫ", "ẫ", "Ậ", "ậ",
        "Ắ", "ắ", "Ằ", "ằ", "Ẳ", "ẳ", "Ẵ", "ẵ", "Ặ", "ặ", "Ẹ", "ẹ", "Ẻ",
        "ẻ", "Ẽ", "ẽ", "Ế", "ế", "Ề", "ề", "Ể", "ể", "Ễ", "ễ", "Ệ", "ệ",
        "Ỉ", "ỉ", "Ị", "ị", "Ọ", "ọ", "Ỏ", "ỏ", "Ố", "ố", "Ồ", "ồ", "Ổ",
        "ổ", "Ỗ", "ỗ", "Ộ", "ộ", "Ớ", "ớ", "Ờ", "ờ", "Ở", "ở", "Ỡ", "ỡ",
        "Ợ", "ợ", "Ụ", "ụ", "Ủ", "ủ", "Ứ", "ứ", "Ừ", "ừ", "Ử", "ử", "Ữ",
        "ữ", "Ự", "ự", "ý", "ỳ", "ỷ", "ỹ", "ỵ", "Ý", "Ỳ", "Ỷ", "Ỹ", "Ỵ"
        ]
  
        const dist: string[] = [
        "A", "A", "A", "A", "E",
        "E", "E", "I", "I", "O", "O", "O", "O", "U", "U", "Y", "a", "a",
        "a", "a", "e", "e", "e", "i", "i", "o", "o", "o", "o", "u", "u",
        "y", "A", "a", "D", "d", "I", "i", "U", "u", "O", "o", "U", "u",
        "A", "a", "A", "a", "A", "a", "A", "a", "A", "a", "A", "a", "A",
        "a", "A", "a", "A", "a", "A", "a", "A", "a", "A", "a", "E", "e",
        "E", "e", "E", "e", "E", "e", "E", "e", "E", "e", "E", "e", "E",
        "e", "I", "i", "I", "i", "O", "o", "O", "o", "O", "o", "O", "o",
        "O", "o", "O", "o", "O", "o", "O", "o", "O", "o", "O", "o", "O",
        "o", "O", "o", "U", "u", "U", "u", "U", "u", "U", "u", "U", "u",
        "U", "u", "U", "u", "y", "y", "y", "y", "y", "Y", "Y", "Y", "Y", "Y"
        ]
  
        let result = input;
        for(let i = 0; i< source.length; i++){
            result = result.replace(source[i], dist[i]);
        }

        return result
      };
  
    static generateRandom(n: number): string {
        const letters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" ;
        let result = "" ;
        for( let i = 0; i < n; i++ ){
            let rd = Math.floor(Math.random() * letters.length) + 1;
            if (rd < letters.length)
                result += letters[rd];
        }

        return result;
    };

    static mask(input: string, start: number): string {
        if (input.length <= start + 5) {
            return input.substring(0,1) + "******"  + input.substring(input.length-1,input.length)
        }
        return input.substring(0,start) +  
                    "********" + 
                    input.substring(input.length-3,input.length)
    }

    static isEmtpty(input: string): boolean {
        return input.trim()=== ""
    }

    static isValidPassWord(pwd: string): boolean {
        return new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/).test(pwd)
    }

    static isValidEmail(email: string): boolean {
        return new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(email)
    }
}
