const utils = require('./utils');

describe('start up', () => {
  beforeEach(async () => {
    await utils.cleanFolder();
  });

  it('should start fine with no docker compose files in the folder', async () => {
    await utils.up();

    const ping = await utils.fetchJson(utils.url);
    expect(ping).to.deep.equal({ ok: true });
  });

  it('should start fine with one docker-compose file in the folder', async () => {
    await utils.setVersion('one-two.yml', '1.0.0');
    await utils.up();

    const ping = await utils.fetchJson(utils.url);
    expect(ping).to.deep.equal({ ok: true });

    expect(await utils.getServiceVersion('one-two.yml', 'one')).to.equal('1.0.0');
    expect(await utils.getServiceVersion('one-two.yml', 'two')).to.equal('1.0.0');

    await expect(utils.getServiceVersion('one-two.yml', 'three')).to.be.rejected;
  });

  it('should start fine with two docker-compose files in the folder', async () => {
    await utils.setVersion('one-two.yml', '1.0.0');
    await utils.setVersion('three.yml', '1.0.0');
    await utils.up();

    const ping = await utils.fetchJson(utils.url);
    expect(ping).to.deep.equal({ ok: true });

    expect(await utils.getServiceVersion('one-two.yml', 'one')).to.equal('1.0.0');
    expect(await utils.getServiceVersion('one-two.yml', 'two')).to.equal('1.0.0');
    expect(await utils.getServiceVersion('three.yml', 'three')).to.equal('1.0.0');
  });

  it('should start fine with already running containers', async () => {
    await utils.setVersion('one-two.yml', '1.0.0');
    await utils.setVersion('three.yml', '1.0.0');

    await utils.testComposeCommand('one-two.yml', 'up -d');

    expect(await utils.getServiceVersion('one-two.yml', 'one')).to.equal('1.0.0');
    expect(await utils.getServiceVersion('one-two.yml', 'two')).to.equal('1.0.0');

    await utils.up();

    expect(await utils.getServiceVersion('one-two.yml', 'one')).to.equal('1.0.0');
    expect(await utils.getServiceVersion('one-two.yml', 'two')).to.equal('1.0.0');
  });

  it('should return error when images are missing', async () => {
    await utils.setVersion('one-two.yml', '10.0.0');

    const result = await expect(utils.up()).to.be.rejected;
    expect(result.error).to.equal(true);
    expect(result.reason).to.include(
      'manifest for localhost:5000/upgrade/one:10.0.0 not found: manifest unknown: manifest unknown'
    );
  });
});
