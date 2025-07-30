import { invoke } from '@tauri-apps/api/core'
import type { Template, Tag } from '../types'

/**
 * 数据库服务类，提供与Rust后端数据库交互的方法
 */
export class DatabaseService {
  /**
   * 初始化数据库
   */
  static async initDatabase(): Promise<string> {
    try {
      return await invoke<string>('init_database')
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw error
    }
  }

  /**
   * 获取所有模板
   */
  static async getAllTemplates(): Promise<Template[]> {
    try {
      return await invoke<Template[]>('get_all_templates')
    } catch (error) {
      console.error('Failed to get all templates:', error)
      return get_all_templates_sample()
    }
  }

  /**
   * 根据ID获取模板
   */
  static async getTemplateById(id: string): Promise<Template | null> {
    try {
      return await invoke<Template | null>('get_template_by_id', { id })
    } catch (error) {
      console.error('Failed to get template by id:', error)
      throw error
    }
  }

  /**
   * 保存模板
   */
  static async saveTemplate(template: Template): Promise<string> {
    try {
      console.log('saveTemplate', template);
      return await invoke<string>('save_template', { template })

    } catch (error) {
      console.error('Failed to save template:', error)
      throw error
    }
  }

  /**
   * 删除模板
   */
  static async deleteTemplate(id: string): Promise<string> {
    try {
      return await invoke<string>('delete_template', { id })
    } catch (error) {
      console.error('Failed to delete template:', error)
      throw error
    }
  }

  /**
   * 切换模板收藏状态
   */
  static async toggleTemplateFavorite(id: string): Promise<string> {
    try {
      return await invoke<string>('toggle_template_favorite', { id })
    } catch (error) {
      console.error('Failed to toggle template favorite:', error)
      throw error
    }
  }

  /**
   * 搜索模板
   */
  static async searchTemplates(keyword: string): Promise<Template[]> {
    try {
      return await invoke<Template[]>('search_templates', { keyword })
    } catch (error) {
      console.error('Failed to search templates:', error)
      throw error
    }
  }

  /**
   * 获取所有疾病分类
   */
  static async getAllDiseases(): Promise<string[]> {
    try {
      return await invoke<string[]>('get_all_diseases')
    } catch (error) {
      console.error('Failed to get all diseases:', error)
      throw error
    }
  }

  /**
   * 保存疾病分类
   */
  static async saveDisease(disease: string): Promise<string> {
    try {
      return await invoke<string>('save_disease', { disease })
    } catch (error) {
      console.error('Failed to save disease:', error)
      throw error
    }
  }

  /**
   * 获取所有模板类型
   */
  static async getAllTemplateTypes(): Promise<string[]> {
    try {
      return await invoke<string[]>('get_all_template_types')
    } catch (error) {
      console.error('Failed to get all template types:', error)
      throw error
    }
  }

  /**
   * 保存模板类型
   */
  static async saveTemplateType(templateType: string): Promise<string> {
    try {
      return await invoke<string>('save_template_type', { templateType })
    } catch (error) {
      console.error('Failed to save template type:', error)
      throw error
    }
  }

  /**
   * 获取所有标签
   */
  static async getAllTags(): Promise<Tag[]> {
    try {
      return await invoke<Tag[]>('get_all_tags')
    } catch (error) {
      console.error('Failed to get all tags:', error)
      throw error
    }
  }

  /**
   * 保存标签
   */
  static async saveTag(tag: Tag): Promise<string> {
    try {
      return await invoke<string>('save_tag', { tag })
    } catch (error) {
      console.error('Failed to save tag:', error)
      throw error
    }
  }

  /**
   * 初始化示例数据
   */
  static async initSampleData(): Promise<string> {
    try {
      return await invoke<string>('init_sample_data')
    } catch (error) {
      console.error('Failed to initialize sample data:', error)
      throw error
    }
  }
}

/**
 * 数据库初始化钩子
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Initializing database...')
    await DatabaseService.initDatabase()
    console.log('Database initialized successfully')

    // 检查是否需要初始化示例数据
    const templates = await DatabaseService.getAllTemplates()
    if (templates.length === 0) {
      console.log('No templates found, initializing sample data...')
      await DatabaseService.initSampleData()
      console.log('Sample data initialized successfully')
    }
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

// 模拟模板数据
async function get_all_templates_sample(): Promise<Template[]> {
  const templates: Template[] = [
    {
      id: '1',
      title: '高血压病历模板',
      sections: [
        { title: '主诉', content: '头痛、头晕3天' },
        { title: '现病史', content: '患者3天前无明显诱因出现头痛、头晕，伴恶心，无呕吐，无胸闷气短。' },
        { title: '既往史', content: '高血压病史5年，平时服用降压药物控制。' },
        { title: '体格检查', content: '血压：160/95mmHg，心率：78次/分，律齐。' },
        { title: '诊断', content: '高血压病2级（极高危）' }
      ],
      disease: '心血管疾病',
      templateType: '门诊病历',
      tags: ['常见病', '慢性病'],
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
      isFavorite: true
    },
    {
      id: '2',
      title: '糖尿病病历模板',
      sections: [
        { title: '主诉', content: '多饮、多尿、多食、消瘦2月' },
        { title: '现病史', content: '患者2月前开始出现多饮、多尿、多食，体重下降5kg。' },
        { title: '既往史', content: '否认糖尿病家族史。' },
        { title: '体格检查', content: '体重：65kg，身高：170cm，BMI：22.5' },
        { title: '辅助检查', content: '空腹血糖：12.5mmol/L，糖化血红蛋白：9.2%' },
        { title: '诊断', content: '2型糖尿病' }
      ],
      disease: '内分泌疾病',
      templateType: '门诊病历',
      tags: ['常见病', '慢性病'],
      createdAt: Date.now() - 172800000,
      updatedAt: Date.now() - 172800000,
      isFavorite: false
    },
    {
      id: '3',
      title: '急性心肌梗死病历模板',
      sections: [
        { title: '主诉', content: '胸痛3小时' },
        { title: '现病史', content: '患者3小时前突发胸骨后压榨性疼痛，向左肩背部放射，伴大汗、恶心。' },
        { title: '既往史', content: '高血压病史10年，吸烟史20年。' },
        { title: '体格检查', content: '血压：90/60mmHg，心率：110次/分，心律不齐。' },
        { title: '辅助检查', content: '心电图：V1-V6导联ST段抬高，肌钙蛋白I：15.2ng/ml' },
        { title: '诊断', content: '急性ST段抬高型心肌梗死' }
      ],
      disease: '心血管疾病',
      templateType: '急诊病历',
      tags: ['急危重症', '心血管'],
      createdAt: Date.now() - 259200000,
      updatedAt: Date.now() - 259200000,
      isFavorite: true
    },
    {
      id: '4',
      title: '肺炎病历模板',
      sections: [
        { title: '主诉', content: '发热、咳嗽、咳痰5天' },
        { title: '现病史', content: '患者5天前受凉后出现发热，最高体温39.2℃，伴咳嗽、咳黄痰。' },
        { title: '既往史', content: '平素体健，否认慢性病史。' },
        { title: '体格检查', content: '体温：38.5℃，右下肺可闻及湿性啰音。' },
        { title: '辅助检查', content: '胸片：右下肺片状阴影，WBC：12.5×10^9/L' },
        { title: '诊断', content: '社区获得性肺炎' }
      ],
      disease: '呼吸系统疾病',
      templateType: '住院病历',
      tags: ['感染性疾病', '呼吸系统'],
      createdAt: Date.now() - 345600000,
      updatedAt: Date.now() - 345600000,
      isFavorite: false
    },
    {
      id: '5',
      title: '急性胃炎病历模板',
      sections: [
        { title: '主诉', content: '上腹痛、恶心、呕吐1天' },
        { title: '现病史', content: '患者1天前进食不洁食物后出现上腹痛，伴恶心、呕吐。' },
        { title: '既往史', content: '否认胃病史。' },
        { title: '体格检查', content: '上腹部压痛，无反跳痛，肠鸣音活跃。' },
        { title: '诊断', content: '急性胃炎' }
      ],
      disease: '消化系统疾病',
      templateType: '门诊病历',
      tags: ['急性疾病', '消化系统'],
      createdAt: Date.now() - 432000000,
      updatedAt: Date.now() - 432000000,
      isFavorite: false
    },
    {
      id: '6',
      title: '骨折手术记录模板',
      sections: [
        { title: '术前诊断', content: '右股骨颈骨折' },
        { title: '术后诊断', content: '右股骨颈骨折术后' },
        { title: '手术名称', content: '右股骨颈骨折切开复位内固定术' },
        { title: '手术经过', content: '患者仰卧位，腰硬联合麻醉，常规消毒铺巾...' },
        { title: '术后处理', content: '术后抗感染治疗，功能锻炼指导。' }
      ],
      disease: '骨科疾病',
      templateType: '手术记录',
      tags: ['外科手术', '骨科'],
      createdAt: Date.now() - 518400000,
      updatedAt: Date.now() - 518400000,
      isFavorite: true
    },
    {
      id: '7',
      title: '抑郁症病历模板',
      sections: [
        { title: '主诉', content: '情绪低落、兴趣减退3月' },
        { title: '现病史', content: '患者3月前无明显诱因出现情绪低落，兴趣减退，睡眠障碍。' },
        { title: '既往史', content: '否认精神病史。' },
        { title: '精神检查', content: '意识清楚，情绪低落，思维迟缓，注意力不集中。' },
        { title: '诊断', content: '抑郁症（中度）' }
      ],
      disease: '精神疾病',
      templateType: '门诊病历',
      tags: ['精神疾病', '心理健康'],
      createdAt: Date.now() - 604800000,
      updatedAt: Date.now() - 604800000,
      isFavorite: false
    },
    {
      id: '8',
      title: '小儿发热病历模板',
      sections: [
        { title: '主诉', content: '发热2天' },
        { title: '现病史', content: '患儿2天前无明显诱因出现发热，最高体温39.5℃。' },
        { title: '既往史', content: '足月顺产，生长发育正常。' },
        { title: '体格检查', content: '体温：38.8℃，咽部充血，扁桃体I度肿大。' },
        { title: '诊断', content: '上呼吸道感染' }
      ],
      disease: '儿科疾病',
      templateType: '门诊病历',
      tags: ['儿科', '感染性疾病'],
      createdAt: Date.now() - 691200000,
      updatedAt: Date.now() - 691200000,
      isFavorite: false
    },
    {
      id: '9',
      title: '白内障手术记录模板',
      sections: [
        { title: '术前诊断', content: '双眼老年性白内障' },
        { title: '术后诊断', content: '右眼老年性白内障术后' },
        { title: '手术名称', content: '右眼白内障超声乳化摘除+人工晶体植入术' },
        { title: '手术经过', content: '患者仰卧位，表面麻醉，常规消毒铺巾...' },
        { title: '术后处理', content: '术后抗炎治疗，定期复查。' }
      ],
      disease: '眼科疾病',
      templateType: '手术记录',
      tags: ['外科手术', '眼科'],
      createdAt: Date.now() - 777600000,
      updatedAt: Date.now() - 777600000,
      isFavorite: true
    },
    {
      id: '10',
      title: '皮肤过敏病历模板',
      sections: [
        { title: '主诉', content: '全身皮疹、瘙痒3天' },
        { title: '现病史', content: '患者3天前接触某种化妆品后出现全身皮疹，伴瘙痒。' },
        { title: '既往史', content: '有过敏性体质。' },
        { title: '体格检查', content: '全身散在红色丘疹，部分融合成片。' },
        { title: '诊断', content: '接触性皮炎' }
      ],
      disease: '皮肤科疾病',
      templateType: '门诊病历',
      tags: ['过敏性疾病', '皮肤科'],
      createdAt: Date.now() - 864000000,
      updatedAt: Date.now() - 864000000,
      isFavorite: false
    },
    {
      id: '11',
      title: '妊娠检查记录模板',
      sections: [
        { title: '主诉', content: '停经8周，要求产前检查' },
        { title: '现病史', content: '患者末次月经8周前，停经后无阴道流血。' },
        { title: '既往史', content: '月经规律，否认不良孕产史。' },
        { title: '体格检查', content: '子宫增大如孕8周大小，质软。' },
        { title: '辅助检查', content: 'HCG：15000mIU/ml，B超：宫内早孕' },
        { title: '诊断', content: '早期妊娠' }
      ],
      disease: '妇产科疾病',
      templateType: '门诊病历',
      tags: ['妇产科', '产前检查'],
      createdAt: Date.now() - 950400000,
      updatedAt: Date.now() - 950400000,
      isFavorite: false
    },
    {
      id: '12',
      title: '急性阑尾炎病历模板',
      sections: [
        { title: '主诉', content: '右下腹痛12小时' },
        { title: '现病史', content: '患者12小时前进食后出现上腹痛，后转移至右下腹。' },
        { title: '既往史', content: '平素体健。' },
        { title: '体格检查', content: '右下腹压痛、反跳痛，McBurney点压痛明显。' },
        { title: '辅助检查', content: 'WBC：15.2×10^9/L，中性粒细胞比例：85%' },
        { title: '诊断', content: '急性阑尾炎' }
      ],
      disease: '外科疾病',
      templateType: '急诊病历',
      tags: ['急性疾病', '外科'],
      createdAt: Date.now() - 1036800000,
      updatedAt: Date.now() - 1036800000,
      isFavorite: true
    },
    {
      id: '13',
      title: '慢性肾炎病历模板',
      sections: [
        { title: '主诉', content: '蛋白尿、血尿6月' },
        { title: '现病史', content: '患者6月前体检发现尿蛋白阳性，伴镜下血尿。' },
        { title: '既往史', content: '否认肾病家族史。' },
        { title: '体格检查', content: '血压：140/90mmHg，双下肢轻度水肿。' },
        { title: '辅助检查', content: '尿蛋白：++，尿红细胞：10-15/HP' },
        { title: '诊断', content: '慢性肾小球肾炎' }
      ],
      disease: '泌尿系统疾病',
      templateType: '门诊病历',
      tags: ['慢性病', '泌尿系统'],
      createdAt: Date.now() - 1123200000,
      updatedAt: Date.now() - 1123200000,
      isFavorite: false
    },
    {
      id: '14',
      title: '甲状腺功能亢进病历模板',
      sections: [
        { title: '主诉', content: '心悸、多汗、消瘦3月' },
        { title: '现病史', content: '患者3月前出现心悸、多汗、怕热，体重下降8kg。' },
        { title: '既往史', content: '否认甲状腺疾病史。' },
        { title: '体格检查', content: '甲状腺弥漫性肿大，可闻及血管杂音。' },
        { title: '辅助检查', content: 'TSH：<0.01mIU/L，FT3：15.2pmol/L，FT4：45.6pmol/L' },
        { title: '诊断', content: 'Graves病' }
      ],
      disease: '内分泌疾病',
      templateType: '门诊病历',
      tags: ['内分泌', '甲状腺疾病'],
      createdAt: Date.now() - 1209600000,
      updatedAt: Date.now() - 1209600000,
      isFavorite: false
    },
    {
      id: '15',
      title: '脑梗死病历模板',
      sections: [
        { title: '主诉', content: '左侧肢体无力2小时' },
        { title: '现病史', content: '患者2小时前突发左侧肢体无力，伴言语不清。' },
        { title: '既往史', content: '高血压病史15年，房颤病史5年。' },
        { title: '体格检查', content: '左侧肢体肌力3级，病理征阳性。' },
        { title: '辅助检查', content: '头颅CT：右侧基底节区低密度影' },
        { title: '诊断', content: '急性脑梗死' }
      ],
      disease: '神经系统疾病',
      templateType: '急诊病历',
      tags: ['急危重症', '神经系统'],
      createdAt: Date.now() - 1296000000,
      updatedAt: Date.now() - 1296000000,
      isFavorite: true
    },
    {
      id: '16',
      title: '哮喘病历模板',
      sections: [
        { title: '主诉', content: '反复咳嗽、喘息5年，加重3天' },
        { title: '现病史', content: '患者5年来反复出现咳嗽、喘息，近3天症状加重。' },
        { title: '既往史', content: '有过敏性鼻炎病史。' },
        { title: '体格检查', content: '双肺可闻及广泛哮鸣音。' },
        { title: '辅助检查', content: '肺功能：FEV1/FVC：65%，支气管舒张试验阳性' },
        { title: '诊断', content: '支气管哮喘急性发作期' }
      ],
      disease: '呼吸系统疾病',
      templateType: '门诊病历',
      tags: ['慢性病', '过敏性疾病'],
      createdAt: Date.now() - 1382400000,
      updatedAt: Date.now() - 1382400000,
      isFavorite: false
    },
    {
      id: '17',
      title: '胆囊炎病历模板',
      sections: [
        { title: '主诉', content: '右上腹痛6小时' },
        { title: '现病史', content: '患者6小时前进食油腻食物后出现右上腹痛。' },
        { title: '既往史', content: '有胆囊结石病史。' },
        { title: '体格检查', content: '右上腹压痛，Murphy征阳性。' },
        { title: '辅助检查', content: 'B超：胆囊壁增厚，胆囊内多发结石' },
        { title: '诊断', content: '急性胆囊炎' }
      ],
      disease: '消化系统疾病',
      templateType: '急诊病历',
      tags: ['急性疾病', '消化系统'],
      createdAt: Date.now() - 1468800000,
      updatedAt: Date.now() - 1468800000,
      isFavorite: false
    },
    {
      id: '18',
      title: '类风湿关节炎病历模板',
      sections: [
        { title: '主诉', content: '双手关节疼痛、晨僵1年' },
        { title: '现病史', content: '患者1年来双手关节疼痛，晨僵持续1小时以上。' },
        { title: '既往史', content: '否认关节炎家族史。' },
        { title: '体格检查', content: '双手近端指间关节肿胀、压痛。' },
        { title: '辅助检查', content: 'RF：120IU/ml，抗CCP抗体阳性' },
        { title: '诊断', content: '类风湿关节炎' }
      ],
      disease: '风湿免疫疾病',
      templateType: '门诊病历',
      tags: ['慢性病', '风湿免疫'],
      createdAt: Date.now() - 1555200000,
      updatedAt: Date.now() - 1555200000,
      isFavorite: false
    },
    {
      id: '19',
      title: '痔疮病历模板',
      sections: [
        { title: '主诉', content: '便血、肛门疼痛1月' },
        { title: '现病史', content: '患者1月来排便时出血，伴肛门疼痛。' },
        { title: '既往史', content: '有便秘史。' },
        { title: '体格检查', content: '肛门3、7、11点见内痔，质软。' },
        { title: '诊断', content: '内痔（II期）' }
      ],
      disease: '外科疾病',
      templateType: '门诊病历',
      tags: ['常见病', '外科'],
      createdAt: Date.now() - 1641600000,
      updatedAt: Date.now() - 1641600000,
      isFavorite: false
    },
    {
      id: '20',
      title: '癫痫病历模板',
      sections: [
        { title: '主诉', content: '反复抽搐发作2年' },
        { title: '现病史', content: '患者2年来反复出现全身强直阵挛性发作。' },
        { title: '既往史', content: '有头外伤史。' },
        { title: '体格检查', content: '神经系统检查无明显异常。' },
        { title: '辅助检查', content: '脑电图：双侧额颞区尖波、棘波' },
        { title: '诊断', content: '癫痫（全面性强直阵挛发作）' }
      ],
      disease: '神经系统疾病',
      templateType: '门诊病历',
      tags: ['慢性病', '神经系统'],
      createdAt: Date.now() - 1728000000,
      updatedAt: Date.now() - 1728000000,
      isFavorite: false
    },
    {
      id: '21',
      title: '乳腺癌病历模板',
      sections: [
        { title: '主诉', content: '发现左乳肿块2月' },
        { title: '现病史', content: '患者2月前自摸发现左乳外上象限肿块。' },
        { title: '既往史', content: '否认乳腺疾病史。' },
        { title: '体格检查', content: '左乳外上象限可触及2×2cm肿块，质硬。' },
        { title: '辅助检查', content: '乳腺钼靶：左乳BI-RADS 5类，病理：浸润性导管癌' },
        { title: '诊断', content: '左乳浸润性导管癌' }
      ],
      disease: '肿瘤疾病',
      templateType: '住院病历',
      tags: ['肿瘤', '外科'],
      createdAt: Date.now() - 1814400000,
      updatedAt: Date.now() - 1814400000,
      isFavorite: true
    },
    {
      id: '22',
      title: '前列腺增生病历模板',
      sections: [
        { title: '主诉', content: '排尿困难、夜尿增多1年' },
        { title: '现病史', content: '患者1年来排尿困难，尿线细，夜尿4-5次。' },
        { title: '既往史', content: '否认泌尿系统疾病史。' },
        { title: '体格检查', content: '前列腺增大，质韧，表面光滑。' },
        { title: '辅助检查', content: 'PSA：3.2ng/ml，B超：前列腺体积60ml' },
        { title: '诊断', content: '良性前列腺增生' }
      ],
      disease: '泌尿系统疾病',
      templateType: '门诊病历',
      tags: ['老年病', '泌尿系统'],
      createdAt: Date.now() - 1900800000,
      updatedAt: Date.now() - 1900800000,
      isFavorite: false
    },
    {
      id: '23',
      title: '青光眼病历模板',
      sections: [
        { title: '主诉', content: '视力下降、眼胀痛3月' },
        { title: '现病史', content: '患者3月来视力逐渐下降，伴眼胀痛。' },
        { title: '既往史', content: '有高度近视史。' },
        { title: '体格检查', content: '眼压：右眼35mmHg，左眼32mmHg' },
        { title: '辅助检查', content: '视野检查：双眼视野缺损，OCT：视神经纤维层变薄' },
        { title: '诊断', content: '原发性开角型青光眼' }
      ],
      disease: '眼科疾病',
      templateType: '门诊病历',
      tags: ['慢性病', '眼科'],
      createdAt: Date.now() - 1987200000,
      updatedAt: Date.now() - 1987200000,
      isFavorite: false
    },
    {
      id: '24',
      title: '耳鸣病历模板',
      sections: [
        { title: '主诉', content: '双耳鸣响2周' },
        { title: '现病史', content: '患者2周前无明显诱因出现双耳鸣响。' },
        { title: '既往史', content: '否认耳部疾病史。' },
        { title: '体格检查', content: '双侧鼓膜完整，听力粗测正常。' },
        { title: '辅助检查', content: '纯音测听：双耳高频听力下降' },
        { title: '诊断', content: '神经性耳鸣' }
      ],
      disease: '耳鼻喉疾病',
      templateType: '门诊病历',
      tags: ['耳鼻喉', '神经性疾病'],
      createdAt: Date.now() - 2073600000,
      updatedAt: Date.now() - 2073600000,
      isFavorite: false
    },
    {
      id: '25',
      title: '牙周炎病历模板',
      sections: [
        { title: '主诉', content: '牙龈出血、口臭6月' },
        { title: '现病史', content: '患者6月来刷牙时牙龈出血，伴口臭。' },
        { title: '既往史', content: '口腔卫生习惯不良。' },
        { title: '体格检查', content: '牙龈红肿，探诊出血，牙周袋深度4-6mm。' },
        { title: '辅助检查', content: 'X线片：牙槽骨吸收' },
        { title: '诊断', content: '慢性牙周炎' }
      ],
      disease: '口腔疾病',
      templateType: '门诊病历',
      tags: ['口腔科', '慢性病'],
      createdAt: Date.now() - 2160000000,
      updatedAt: Date.now() - 2160000000,
      isFavorite: false
    },
    {
      id: '26',
      title: '腰椎间盘突出病历模板',
      sections: [
        { title: '主诉', content: '腰痛伴左下肢放射痛3月' },
        { title: '现病史', content: '患者3月前搬重物后出现腰痛，伴左下肢放射痛。' },
        { title: '既往史', content: '有腰部外伤史。' },
        { title: '体格检查', content: '腰4-5棘突间压痛，直腿抬高试验阳性。' },
        { title: '辅助检查', content: '腰椎MRI：L4-5椎间盘突出' },
        { title: '诊断', content: '腰4-5椎间盘突出症' }
      ],
      disease: '骨科疾病',
      templateType: '门诊病历',
      tags: ['骨科', '慢性病'],
      createdAt: Date.now() - 2246400000,
      updatedAt: Date.now() - 2246400000,
      isFavorite: true
    },
    {
      id: '27',
      title: '荨麻疹病历模板',
      sections: [
        { title: '主诉', content: '全身风团、瘙痒1周' },
        { title: '现病史', content: '患者1周前进食海鲜后出现全身风团，伴瘙痒。' },
        { title: '既往史', content: '有食物过敏史。' },
        { title: '体格检查', content: '全身散在大小不等风团，部分融合。' },
        { title: '诊断', content: '急性荨麻疹' }
      ],
      disease: '皮肤科疾病',
      templateType: '门诊病历',
      tags: ['过敏性疾病', '皮肤科'],
      createdAt: Date.now() - 2332800000,
      updatedAt: Date.now() - 2332800000,
      isFavorite: false
    },
    {
      id: '28',
      title: '子宫肌瘤病历模板',
      sections: [
        { title: '主诉', content: '月经量增多、经期延长1年' },
        { title: '现病史', content: '患者1年来月经量明显增多，经期延长至10天。' },
        { title: '既往史', content: '月经规律，无不良孕产史。' },
        { title: '体格检查', content: '子宫增大如孕12周大小，质硬。' },
        { title: '辅助检查', content: 'B超：子宫多发肌瘤，最大约5×4cm' },
        { title: '诊断', content: '子宫多发性肌瘤' }
      ],
      disease: '妇产科疾病',
      templateType: '门诊病历',
      tags: ['妇产科', '良性肿瘤'],
      createdAt: Date.now() - 2419200000,
      updatedAt: Date.now() - 2419200000,
      isFavorite: false
    },
    {
      id: '29',
      title: '痛风病历模板',
      sections: [
        { title: '主诉', content: '右足第一跖趾关节疼痛2天' },
        { title: '现病史', content: '患者2天前饮酒后出现右足第一跖趾关节剧烈疼痛。' },
        { title: '既往史', content: '有高尿酸血症病史。' },
        { title: '体格检查', content: '右足第一跖趾关节红肿、压痛明显。' },
        { title: '辅助检查', content: '血尿酸：580μmol/L' },
        { title: '诊断', content: '痛风性关节炎急性发作' }
      ],
      disease: '风湿免疫疾病',
      templateType: '急诊病历',
      tags: ['急性疾病', '风湿免疫'],
      createdAt: Date.now() - 2505600000,
      updatedAt: Date.now() - 2505600000,
      isFavorite: false
    },
    {
      id: '30',
      title: '慢性阻塞性肺疾病病历模板',
      sections: [
        { title: '主诉', content: '慢性咳嗽、咳痰、气短10年，加重1周' },
        { title: '现病史', content: '患者10年来慢性咳嗽、咳痰，活动后气短，近1周症状加重。' },
        { title: '既往史', content: '吸烟史30年，每日1包。' },
        { title: '体格检查', content: '桶状胸，双肺呼吸音减弱，可闻及干啰音。' },
        { title: '辅助检查', content: '肺功能：FEV1/FVC：55%，胸片：双肺纹理增粗' },
        { title: '诊断', content: '慢性阻塞性肺疾病急性加重期' }
      ],
      disease: '呼吸系统疾病',
      templateType: '住院病历',
      tags: ['慢性病', '呼吸系统'],
      createdAt: Date.now() - 2592000000,
      updatedAt: Date.now() - 2592000000,
      isFavorite: true
    }
  ]

  return templates
}